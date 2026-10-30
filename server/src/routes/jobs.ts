import { Router, Request, Response } from "express";
import { z } from "zod";
import { Role, CompanyStatus, JobStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole } from "../middleware/auth";
import { createAuditLog } from "../services/audit";
import { notifyTPOs } from "../services/notification";

export const jobsRouter = Router();

const createJobSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(5, "Description is required"),
  ctc_lpa: z.coerce.number().positive("CTC must be a positive number"),
  min_cgpa: z.coerce.number().min(0).max(10, "CGPA must be between 0 and 10"),
  max_backlogs: z.coerce.number().int().min(0, "Backlogs must be 0 or greater"),
  department_ids: z.array(z.string().uuid()).min(1, "At least one department is required"),
  application_deadline: z.string().datetime().refine(
    (val) => new Date(val) > new Date(),
    "Application deadline must be in the future"
  ),
});

const patchJobSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  ctc_lpa: z.coerce.number().positive().optional(),
  min_cgpa: z.coerce.number().min(0).max(10).optional(),
  max_backlogs: z.coerce.number().int().min(0).optional(),
  department_ids: z.array(z.string().uuid()).min(1).optional(),
  application_deadline: z.string().datetime().optional(),
});

// POST /jobs [COMPANY with status APPROVED]
jobsRouter.post(
  "/jobs",
  authenticate,
  requireRole([Role.COMPANY]),
  async (req: Request, res: Response) => {
    const parseResult = createJobSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid job posting fields.",
          details: parseResult.error.errors,
        },
      });
    }

    const {
      title,
      description,
      ctc_lpa,
      min_cgpa,
      max_backlogs,
      department_ids,
      application_deadline,
    } = parseResult.data;

    // Check company status
    const company = await prisma.company.findUnique({
      where: { user_id: req.user!.id },
    });

    if (!company) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Company profile not found.",
        },
      });
    }

    if (company.status !== CompanyStatus.APPROVED) {
      return res.status(403).json({
        error: {
          code: "COMPANY_NOT_APPROVED",
          message: "Your company account has not been approved by the TPO yet.",
        },
      });
    }

    // Create Job
    const job = await prisma.job.create({
      data: {
        company_id: company.id,
        title,
        description,
        ctc_lpa,
        min_cgpa,
        max_backlogs,
        application_deadline: new Date(application_deadline),
        status: JobStatus.PENDING_APPROVAL,
        job_departments: {
          create: department_ids.map((deptId) => ({
            department_id: deptId,
          })),
        },
      },
      include: {
        job_departments: {
          include: {
            department: true,
          },
        },
      },
    });

    // Notify TPOs
    await notifyTPOs({
      type: "JOB_PENDING",
      message: `${company.company_name} submitted a new placement drive: ${job.title}`,
      linkPath: `/tpo/approvals`,
    });

    res.status(201).json({
      data: {
        id: job.id,
        title: job.title,
        description: job.description,
        ctc_lpa: Number(job.ctc_lpa),
        min_cgpa: Number(job.min_cgpa),
        max_backlogs: job.max_backlogs,
        status: job.status,
        application_deadline: job.application_deadline.toISOString(),
        departments: job.job_departments.map((jd) => jd.department.code),
      },
    });
  }
);

// PATCH /jobs/:id [COMPANY owner while PENDING_APPROVAL; or TPO]
jobsRouter.patch(
  "/jobs/:id",
  authenticate,
  requireRole([Role.COMPANY, Role.TPO]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const parseResult = patchJobSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid update fields.",
          details: parseResult.error.errors,
        },
      });
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!job) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Job drive not found.",
        },
      });
    }

    // Role ownership constraints
    if (req.user!.role === Role.COMPANY) {
      if (job.company.user_id !== req.user!.id) {
        return res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to modify this job drive.",
          },
        });
      }
      if (job.status !== JobStatus.PENDING_APPROVAL) {
        return res.status(409).json({
          error: {
            code: "CONFLICT",
            message: "Company can only edit jobs while they are pending approval.",
          },
        });
      }
    }

    const updateData: any = {};
    if (parseResult.data.title) updateData.title = parseResult.data.title;
    if (parseResult.data.description) updateData.description = parseResult.data.description;
    if (parseResult.data.min_cgpa !== undefined) updateData.min_cgpa = parseResult.data.min_cgpa;
    if (parseResult.data.max_backlogs !== undefined) updateData.max_backlogs = parseResult.data.max_backlogs;
    if (parseResult.data.application_deadline) {
      updateData.application_deadline = new Date(parseResult.data.application_deadline);
    }

    // CTC change audit log
    if (parseResult.data.ctc_lpa !== undefined) {
      const oldCtc = Number(job.ctc_lpa);
      const newCtc = Number(parseResult.data.ctc_lpa);
      if (oldCtc !== newCtc) {
        updateData.ctc_lpa = newCtc;
        await createAuditLog({
          actorUserId: req.user!.id,
          action: "JOB_CTC_CHANGED",
          entityType: "job",
          entityId: job.id,
          metadata: { old_ctc: oldCtc, new_ctc: newCtc },
        });
      }
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      data: {
        id: updatedJob.id,
        title: updatedJob.title,
        ctc_lpa: Number(updatedJob.ctc_lpa),
        status: updatedJob.status,
      },
    });
  }
);

// GET /company/jobs [COMPANY]
jobsRouter.get(
  "/company/jobs",
  authenticate,
  requireRole([Role.COMPANY]),
  async (req: Request, res: Response) => {
    const company = await prisma.company.findUnique({
      where: { user_id: req.user!.id },
    });

    if (!company) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Company profile not found." },
      });
    }

    const jobs = await prisma.job.findMany({
      where: { company_id: company.id },
      include: {
        _count: { select: { applications: true } },
        job_departments: { include: { department: true } },
      },
      orderBy: { created_at: "desc" },
    });

    res.status(200).json({
      data: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        ctc_lpa: Number(j.ctc_lpa),
        status: j.status,
        application_deadline: j.application_deadline.toISOString(),
        applicant_count: j._count.applications,
        departments: j.job_departments.map((jd) => jd.department.code),
      })),
    });
  }
);

