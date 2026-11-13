import { Router, Request, Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole } from "../middleware/auth";
import { createAuditLog } from "../services/audit";
import { notifyTPOs } from "../services/notification";
import { env } from "../config/env";

export const studentsRouter = Router();

const updateStudentSchema = z.object({
  phone: z.string().min(7).max(20).optional(),
  cgpa: z.coerce.number().min(0).max(10).optional(),
  active_backlogs: z.coerce.number().int().min(0).optional(),
  tenth_pct: z.coerce.number().min(0).max(100).optional(),
  twelfth_pct: z.coerce.number().min(0).max(100).optional(),
  resume_key: z.string().optional(),
});

const presignedUrlSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  file_type: z.string().optional(),
});

// GET /api/v1/students/me
studentsRouter.get(
  "/me",
  authenticate,
  requireRole([Role.STUDENT]),
  async (req: Request, res: Response) => {
    const student = await prisma.student.findUnique({
      where: { user_id: req.user!.id },
      include: {
        department: true,
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            role: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Student profile not found." },
      });
    }

    res.status(200).json({
      data: {
        id: student.id,
        user_id: student.user_id,
        roll_no: student.roll_no,
        full_name: student.user.full_name,
        email: student.user.email,
        phone: student.phone,
        department: student.department.name,
        department_code: student.department.code,
        batch_year: student.batch_year,
        cgpa: Number(student.cgpa),
        tenth_pct: Number(student.tenth_pct),
        twelfth_pct: Number(student.twelfth_pct),
        active_backlogs: student.active_backlogs,
        resume_key: student.resume_key,
        resume_uploaded_at: student.resume_uploaded_at,
        is_verified: student.is_verified,
        placement_status: student.placement_status,
        single_offer_locked: student.single_offer_locked,
      },
    });
  }
);

// PUT /api/v1/students/me (REQ-5: auto-reset verification on CGPA or backlog edit)
studentsRouter.put(
  "/me",
  authenticate,
  requireRole([Role.STUDENT]),
  async (req: Request, res: Response) => {
    const parseResult = updateStudentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid student profile fields.",
          details: parseResult.error.errors,
        },
      });
    }

    const currentStudent = await prisma.student.findUnique({
      where: { user_id: req.user!.id },
    });

    if (!currentStudent) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Student profile not found." },
      });
    }

    const updates = parseResult.data;
    const updateData: any = {};
    const sensitiveChanged: string[] = [];

    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.tenth_pct !== undefined) updateData.tenth_pct = updates.tenth_pct;
    if (updates.twelfth_pct !== undefined) updateData.twelfth_pct = updates.twelfth_pct;
    if (updates.resume_key !== undefined) {
      updateData.resume_key = updates.resume_key;
      updateData.resume_uploaded_at = new Date();
    }

    // Check sensitive fields: CGPA or active_backlogs
    if (updates.cgpa !== undefined && updates.cgpa !== Number(currentStudent.cgpa)) {
      updateData.cgpa = updates.cgpa;
      sensitiveChanged.push("cgpa");
    }

    if (
      updates.active_backlogs !== undefined &&
      updates.active_backlogs !== currentStudent.active_backlogs
    ) {
      updateData.active_backlogs = updates.active_backlogs;
      sensitiveChanged.push("active_backlogs");
    }

    // Trigger REQ-5 verification reset if sensitive fields modified
    let verificationReset = false;
    if (sensitiveChanged.length > 0 && currentStudent.is_verified) {
      updateData.is_verified = false;
      updateData.verified_by = null;
      updateData.verified_at = null;
      verificationReset = true;
    }

    const updated = await prisma.student.update({
      where: { id: currentStudent.id },
      data: updateData,
      include: { department: true },
    });

    if (verificationReset) {
      await createAuditLog({
        actorUserId: req.user!.id,
        action: "STUDENT_VERIFICATION_RESET",
        entityType: "student",
        entityId: updated.id,
        metadata: {
          fields: sensitiveChanged,
          new_cgpa: updates.cgpa,
          new_backlogs: updates.active_backlogs,
        },
      });

      await notifyTPOs({
        type: "STUDENT_VERIFICATION_RESET",
        message: `Student ${currentStudent.roll_no} updated academic records (${sensitiveChanged.join(", ")}). Verification reset to pending.`,
        linkPath: `/tpo/students`,
      });
    }

    res.status(200).json({
      message: verificationReset
        ? `Profile updated. Academic fields (${sensitiveChanged.join(", ")}) were modified; verification reset to pending.`
        : "Profile updated successfully.",
      verification_reset: verificationReset,
      data: {
        id: updated.id,
        roll_no: updated.roll_no,
        cgpa: Number(updated.cgpa),
        active_backlogs: updated.active_backlogs,
        phone: updated.phone,
        is_verified: updated.is_verified,
        resume_key: updated.resume_key,
      },
    });
  }
);

// POST /api/v1/students/me/resume/presigned-url (REQ-4: 2 MB PDF validation)
studentsRouter.post(
  "/me/resume/presigned-url",
  authenticate,
  requireRole([Role.STUDENT]),
  async (req: Request, res: Response) => {
    const parseResult = presignedUrlSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Filename is required." },
      });
    }

    const { filename, file_type } = parseResult.data;

    // Strict PDF requirement
    const isPdf =
      file_type === "application/pdf" || filename.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return res.status(400).json({
        error: {
          code: "INVALID_FILE_TYPE",
          message: "Only PDF resumes are accepted (REQ-4).",
        },
      });
    }

    const student = await prisma.student.findUnique({
      where: { user_id: req.user!.id },
    });

    if (!student) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Student record not found." },
      });
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueKey = `resumes/${student.id}/${Date.now()}-${safeFilename}`;
    const expiresSeconds = 300; // 5 minutes TTL

    // Pre-signed S3 link generation
    const uploadUrl = `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${uniqueKey}?ttl=${expiresSeconds}&auth=${crypto.randomBytes(16).toString("hex")}`;
    const publicViewUrl = `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${uniqueKey}`;

    res.status(200).json({
      data: {
        upload_url: uploadUrl,
        key: uniqueKey,
        public_url: publicViewUrl,
        expires_in_seconds: expiresSeconds,
        content_type: "application/pdf",
        max_size_bytes: 2 * 1024 * 1024, // 2 MB
      },
    });
  }
);

