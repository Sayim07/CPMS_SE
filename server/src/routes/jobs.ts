import { Router, Request, Response } from "express";
import { z } from "zod";
import { Role, CompanyStatus, JobStatus, ApplicationStage } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole } from "../middleware/auth";
import { createAuditLog } from "../services/audit";
import { notifyTPOs } from "../services/notification";
import { evaluateEligibility } from "../services/eligibility";

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

// GET /jobs — Public / Student view of available jobs (with Eligibility Engine verdict for students)
jobsRouter.get("/jobs", authenticate, async (req: Request, res: Response) => {
  const now = new Date();
  const user = req.user;

  // TPO and ADMIN can view all statuses; Students and Companies only view ACTIVE jobs
  const isPrivileged = user?.role === Role.TPO || user?.role === Role.ADMIN;
  const whereClause: any = isPrivileged
    ? { deleted_at: null }
    : { status: JobStatus.ACTIVE, deleted_at: null };

  const jobs = await prisma.job.findMany({
    where: whereClause,
    include: {
      company: { select: { company_name: true, website: true } },
      job_departments: { include: { department: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { created_at: "desc" },
  });

  // If student is logged in, attach deterministic eligibility for every job
  let studentData: any = null;
  let settingsSnapshot = { single_offer_ctc_threshold_lpa: 6.0 };

  if (user?.role === Role.STUDENT) {
    studentData = await prisma.student.findUnique({
      where: { user_id: user.id },
      include: { applications: { select: { job_id: true } } },
    });

    const thresholdSetting = await prisma.systemSetting.findUnique({
      where: { key: "single_offer_ctc_threshold_lpa" },
    });
    if (thresholdSetting) {
      settingsSnapshot.single_offer_ctc_threshold_lpa = parseFloat(thresholdSetting.value) || 6.0;
    }
  }

  const result = jobs.map((job) => {
    let eligibility: any = null;
    if (studentData) {
      eligibility = evaluateEligibility(studentData, job, settingsSnapshot, now);
    }

    return {
      id: job.id,
      title: job.title,
      company_name: job.company.company_name,
      website: job.company.website,
      description: job.description,
      ctc_lpa: Number(job.ctc_lpa),
      min_cgpa: Number(job.min_cgpa),
      max_backlogs: job.max_backlogs,
      status: job.status,
      application_deadline: job.application_deadline.toISOString(),
      applicant_count: job._count.applications,
      departments: job.job_departments.map((jd) => jd.department.code),
      department_names: job.job_departments.map((jd) => jd.department.name),
      eligibility,
    };
  });

  res.status(200).json({ data: result });
});

// GET /jobs/:id — Detailed job view + eligibility
jobsRouter.get("/jobs/:id", authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const now = new Date();
  const user = req.user;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, company_name: true, website: true, contact_phone: true } },
      job_departments: { include: { department: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!job) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "Job drive not found." },
    });
  }

  // Access control: only active jobs visible to students/companies unless privileged
  const isPrivileged = user?.role === Role.TPO || user?.role === Role.ADMIN || (user?.role === Role.COMPANY && user.company_id === job.company.id);
  if (!isPrivileged && job.status !== JobStatus.ACTIVE) {
    return res.status(403).json({
      error: { code: "FORBIDDEN", message: "This placement drive is not currently active." },
    });
  }

  let eligibility: any = null;
  if (user?.role === Role.STUDENT) {
    const student = await prisma.student.findUnique({
      where: { user_id: user.id },
      include: { applications: { select: { job_id: true } } },
    });

    if (student) {
      const thresholdSetting = await prisma.systemSetting.findUnique({
        where: { key: "single_offer_ctc_threshold_lpa" },
      });
      const threshold = thresholdSetting ? parseFloat(thresholdSetting.value) || 6.0 : 6.0;
      eligibility = evaluateEligibility(student, job, { single_offer_ctc_threshold_lpa: threshold }, now);
    }
  }

  res.status(200).json({
    data: {
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.company,
      ctc_lpa: Number(job.ctc_lpa),
      min_cgpa: Number(job.min_cgpa),
      max_backlogs: job.max_backlogs,
      status: job.status,
      application_deadline: job.application_deadline.toISOString(),
      applicant_count: job._count.applications,
      departments: job.job_departments.map((jd) => jd.department.code),
      eligibility,
    },
  });
});

// POST /jobs/:id/apply — Phase 4 Core Application Submission with Transactional Eligibility Check
jobsRouter.post(
  "/jobs/:id/apply",
  authenticate,
  requireRole([Role.STUDENT]),
  async (req: Request, res: Response) => {
    const { id: jobId } = req.params;
    const now = new Date();

    const student = await prisma.student.findUnique({
      where: { user_id: req.user!.id },
      include: {
        applications: true,
        department: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Student record not found." },
      });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        job_departments: true,
      },
    });

    if (!job) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Job drive not found." },
      });
    }

    // Load System Setting for Single Offer Lock
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "single_offer_ctc_threshold_lpa" },
    });
    const threshold = setting ? parseFloat(setting.value) || 6.0 : 6.0;

    // Evaluate deterministic eligibility
    const eligibility = evaluateEligibility(
      student,
      job,
      { single_offer_ctc_threshold_lpa: threshold },
      now
    );

    // If student already applied, return 409 Conflict
    if (eligibility.reasons.includes("ALREADY_APPLIED")) {
      return res.status(409).json({
        error: {
          code: "ALREADY_APPLIED",
          message: "You have already applied for this placement drive.",
        },
      });
    }

    // If ineligible, return 422 Unprocessable Entity with reason codes
    if (!eligibility.eligible) {
      return res.status(422).json({
        error: {
          code: "INELIGIBLE",
          message: "You do not satisfy the criteria for this placement drive.",
          reasons: eligibility.reasons,
        },
      });
    }

    // Atomic transaction: create Application record
    const application = await prisma.application.create({
      data: {
        job_id: job.id,
        student_id: student.id,
        stage: ApplicationStage.APPLIED,
      },
    });

    await createAuditLog({
      actorUserId: req.user!.id,
      action: "APPLICATION_SUBMITTED",
      entityType: "application",
      entityId: application.id,
      metadata: { job_id: job.id, title: job.title },
    });

    res.status(201).json({
      message: `Successfully applied to ${job.title} at ${job.company.company_name}.`,
      data: {
        application_id: application.id,
        job_id: job.id,
        stage: application.stage,
        applied_at: application.applied_at.toISOString(),
      },
    });
  }
);

// GET /students/me/applications — Retrieve logged-in student's applications
jobsRouter.get(
  "/students/me/applications",
  authenticate,
  requireRole([Role.STUDENT]),
  async (req: Request, res: Response) => {
    const student = await prisma.student.findUnique({
      where: { user_id: req.user!.id },
    });

    if (!student) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Student record not found." },
      });
    }

    const applications = await prisma.application.findMany({
      where: { student_id: student.id },
      include: {
        job: {
          include: {
            company: { select: { company_name: true, website: true } },
          },
        },
      },
      orderBy: { applied_at: "desc" },
    });

    res.status(200).json({
      data: applications.map((app) => ({
        id: app.id,
        job_id: app.job_id,
        job_title: app.job.title,
        company_name: app.job.company.company_name,
        ctc_lpa: Number(app.job.ctc_lpa),
        stage: app.stage,
        applied_at: app.applied_at.toISOString(),
      })),
    });
  }
);

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
