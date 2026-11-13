import { Router, Request, Response } from "express";
import { z } from "zod";
import { Role, ApplicationStage, PlacementStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole } from "../middleware/auth";
import { createAuditLog } from "../services/audit";
import { notifyUser } from "../services/notification";

export const funnelRouter = Router();

const StageTransitionSchema = z.object({
  stage: z.nativeEnum(ApplicationStage),
});

const RoundCreateSchema = z.object({
  round_name: z.string().min(1).max(100),
  scheduled_at: z.string().datetime(),
  venue_or_link: z.string().min(1).max(300),
});

// Helper to validate state machine transitions conforming to AppFlow.md §5
function isValidTransition(current: ApplicationStage, next: ApplicationStage): boolean {
  if (current === ApplicationStage.APPLIED) {
    return next === ApplicationStage.SHORTLISTED || next === ApplicationStage.REJECTED;
  }
  if (current === ApplicationStage.SHORTLISTED) {
    return next === ApplicationStage.IN_INTERVIEW || next === ApplicationStage.REJECTED;
  }
  if (current === ApplicationStage.IN_INTERVIEW) {
    return next === ApplicationStage.SELECTED || next === ApplicationStage.REJECTED;
  }
  return false;
}

// 5.1 GET /jobs/:id/applications [COMPANY owner, TPO] (Contact Masking per Schema.md §5.5)
funnelRouter.get(
  "/jobs/:id/applications",
  authenticate,
  requireRole([Role.COMPANY, Role.TPO, Role.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const jobId = req.params.id;
      const stageFilter = req.query.stage as ApplicationStage | undefined;

      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { company: true },
      });

      if (!job) {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Job drive not found." },
        });
      }

      // If COMPANY, verify ownership
      if (req.user!.role === Role.COMPANY && job.company.user_id !== req.user!.id) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "You do not own this job drive." },
        });
      }

      const whereClause: any = { job_id: jobId };
      if (stageFilter && Object.values(ApplicationStage).includes(stageFilter)) {
        whereClause.stage = stageFilter;
      }

      const applications = await prisma.application.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: true,
              department: true,
            },
          },
        },
        orderBy: { applied_at: "asc" },
      });

      const isCompany = req.user!.role === Role.COMPANY;

      const data = applications.map((app) => {
        // Privacy by Design: mask phone and email for APPLIED and REJECTED stages when requester is COMPANY
        const maskContact =
          isCompany &&
          (app.stage === ApplicationStage.APPLIED || app.stage === ApplicationStage.REJECTED);

        return {
          id: app.id,
          stage: app.stage,
          applied_at: app.applied_at.toISOString(),
          student: {
            id: app.student.id,
            roll_no: app.student.roll_no,
            full_name: app.student.user.full_name,
            department_code: app.student.department.code,
            cgpa: Number(app.student.cgpa),
            active_backlogs: app.student.active_backlogs,
            email: maskContact ? null : app.student.user.email,
            phone: maskContact ? null : app.student.phone,
          },
        };
      });

      res.status(200).json({ data });
    } catch (error) {
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "Failed to retrieve applicants." },
      });
    }
  }
);

// 5.2 PATCH /applications/:id/stage [COMPANY owner, TPO] (Transition rules per REQ-14, REQ-16)
funnelRouter.patch(
  "/applications/:id/stage",
  authenticate,
  requireRole([Role.COMPANY, Role.TPO, Role.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parseResult = StageTransitionSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid target stage.",
            details: parseResult.error.format(),
          },
        });
      }

      const targetStage = parseResult.data.stage;

      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          job: { include: { company: true } },
          student: { include: { user: true } },
        },
      });

      if (!application) {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Application not found." },
        });
      }

      if (
        req.user!.role === Role.COMPANY &&
        application.job.company.user_id !== req.user!.id
      ) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "You do not own this application." },
        });
      }

      if (!isValidTransition(application.stage, targetStage)) {
        return res.status(409).json({
          error: {
            code: "INVALID_TRANSITION",
            message: `Cannot transition application from ${application.stage} to ${targetStage}.`,
          },
        });
      }

      // Execute transaction for stage update, student placement lock, and audit
      const updatedApplication = await prisma.$transaction(async (tx) => {
        const updated = await tx.application.update({
          where: { id },
          data: { stage: targetStage },
        });

        if (targetStage === ApplicationStage.SELECTED) {
          // 1. Mark student as PLACED
          let singleOfferLocked = false;
          const defaultThreshold = 8.0;

          // Check if system setting exists for single offer threshold
          const setting = await tx.systemSetting.findUnique({
            where: { key: "SINGLE_OFFER_THRESHOLD_LPA" },
          });
          const threshold = setting ? parseFloat(setting.value) : defaultThreshold;

          if (Number(application.job.ctc_lpa) >= threshold) {
            singleOfferLocked = true;
          }

          await tx.student.update({
            where: { id: application.student_id },
            data: {
              placement_status: PlacementStatus.PLACED,
              single_offer_locked: singleOfferLocked,
            },
          });

          // 2. Audit log
          await tx.auditLog.create({
            data: {
              actor_user_id: req.user!.id,
              action: "SELECTION_POSTED",
              entity_type: "application",
              entity_id: application.id,
              metadata: {
                student_id: application.student_id,
                job_id: application.job_id,
                ctc_lpa: Number(application.job.ctc_lpa),
                single_offer_locked: singleOfferLocked,
              },
            },
          });
        }

        return updated;
      });

      // Notify candidate
      const notificationMessage =
        targetStage === ApplicationStage.SELECTED
          ? `Congratulations! You have been selected for ${application.job.title} at ${application.job.company.company_name}.`
          : `Your application status for ${application.job.title} is now ${targetStage}.`;

      await notifyUser({
        userId: application.student.user_id,
        type: `APPLICATION_${targetStage}`,
        message: notificationMessage,
        linkPath: "/student/applications",
      });

      res.status(200).json({
        data: {
          id: updatedApplication.id,
          stage: updatedApplication.stage,
          updated_at: updatedApplication.updated_at.toISOString(),
        },
      });
    } catch (error) {
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "Failed to update application stage." },
      });
    }
  }
);

// 5.4 POST /jobs/:id/rounds [COMPANY owner, TPO]
funnelRouter.post(
  "/jobs/:id/rounds",
  authenticate,
  requireRole([Role.COMPANY, Role.TPO, Role.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const jobId = req.params.id;
      const parseResult = RoundCreateSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid round data.",
            details: parseResult.error.format(),
          },
        });
      }

      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { company: true },
      });

      if (!job) {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Job drive not found." },
        });
      }

      if (req.user!.role === Role.COMPANY && job.company.user_id !== req.user!.id) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "You do not own this job drive." },
        });
      }

      const { round_name, scheduled_at, venue_or_link } = parseResult.data;

      const round = await prisma.interviewRound.create({
        data: {
          job_id: jobId,
          round_name,
          scheduled_at: new Date(scheduled_at),
          venue_or_link,
          created_by: req.user!.id,
        },
      });

      // Notify all applicants currently in SHORTLISTED or IN_INTERVIEW stages
      const activeApplicants = await prisma.application.findMany({
        where: {
          job_id: jobId,
          stage: { in: [ApplicationStage.SHORTLISTED, ApplicationStage.IN_INTERVIEW] },
        },
        include: {
          student: true,
        },
      });

      if (activeApplicants.length > 0) {
        await prisma.notification.createMany({
          data: activeApplicants.map((app) => ({
            user_id: app.student.user_id,
            type: "ROUND_SCHEDULED",
            message: `Interview round "${round_name}" scheduled for ${job.title} at ${venue_or_link}.`,
            link_path: "/student/applications",
          })),
        });
      }

      res.status(201).json({
        data: {
          id: round.id,
          round_name: round.round_name,
          scheduled_at: round.scheduled_at.toISOString(),
          venue_or_link: round.venue_or_link,
          notified_candidates: activeApplicants.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "Failed to schedule round." },
      });
    }
  }
);

// GET /jobs/:id/rounds [COMPANY owner, TPO, STUDENT]
funnelRouter.get(
  "/jobs/:id/rounds",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const jobId = req.params.id;

      const rounds = await prisma.interviewRound.findMany({
        where: { job_id: jobId },
        orderBy: { scheduled_at: "asc" },
      });

      res.status(200).json({
        data: rounds.map((r) => ({
          id: r.id,
          round_name: r.round_name,
          scheduled_at: r.scheduled_at.toISOString(),
          venue_or_link: r.venue_or_link,
          created_at: r.created_at.toISOString(),
        })),
      });
    } catch (error) {
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "Failed to retrieve rounds." },
      });
    }
  }
);

