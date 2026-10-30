import { Router, Request, Response } from "express";
import { z } from "zod";
import { CompanyStatus, JobStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { createAuditLog } from "../services/audit";
import { notifyUser } from "../services/notification";

export const tpoRouter = Router();

const companyDecisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
});

const jobDecisionSchema = z.object({
  decision: z.enum(["ACTIVE", "REJECTED", "CLOSED"]),
});

// GET /api/v1/tpo/companies?status=PENDING
tpoRouter.get("/companies", async (req: Request, res: Response) => {
  const { status } = req.query;

  const whereClause: any = {};
  if (status && typeof status === "string") {
    whereClause.status = status as CompanyStatus;
  }

  const companies = await prisma.company.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          full_name: true,
          email: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  res.status(200).json({
    data: companies.map((c) => ({
      id: c.id,
      company_name: c.company_name,
      website: c.website,
      gst_tax_id: c.gst_tax_id,
      contact_person: c.user.full_name,
      contact_phone: c.contact_phone,
      status: c.status,
    })),
  });
});

// POST /api/v1/tpo/companies/:id/decision
tpoRouter.post("/companies/:id/decision", async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseResult = companyDecisionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Decision must be APPROVED or REJECTED.",
      },
    });
  }

  const company = await prisma.company.findUnique({
    where: { id },
  });

  if (!company) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "Company not found." },
    });
  }

  const newStatus = parseResult.data.decision as CompanyStatus;
  const updated = await prisma.company.update({
    where: { id },
    data: {
      status: newStatus,
      decided_by: req.user!.id,
      decided_at: new Date(),
    },
  });

  await createAuditLog({
    actorUserId: req.user!.id,
    action: newStatus === "APPROVED" ? "COMPANY_APPROVED" : "COMPANY_REJECTED",
    entityType: "company",
    entityId: company.id,
    metadata: { previous_status: company.status, new_status: newStatus },
  });

  await notifyUser({
    userId: company.user_id,
    type: "COMPANY_STATUS_UPDATE",
    message: `Your company registration has been ${newStatus.toLowerCase()} by the TPO.`,
  });

  res.status(200).json({
    data: {
      id: updated.id,
      company_name: updated.company_name,
      status: updated.status,
    },
  });
});

// GET /api/v1/tpo/jobs?status=PENDING_APPROVAL
tpoRouter.get("/jobs", async (req: Request, res: Response) => {
  const { status } = req.query;

  const whereClause: any = {};
  if (status && typeof status === "string") {
    whereClause.status = status as JobStatus;
  }

  const jobs = await prisma.job.findMany({
    where: whereClause,
    include: {
      company: { select: { company_name: true } },
      job_departments: { include: { department: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { created_at: "desc" },
  });

  res.status(200).json({
    data: jobs.map((j) => ({
      id: j.id,
      title: j.title,
      company_name: j.company.company_name,
      ctc_lpa: Number(j.ctc_lpa),
      min_cgpa: Number(j.min_cgpa),
      max_backlogs: j.max_backlogs,
      department_codes: j.job_departments.map((jd) => jd.department.code),
      application_deadline: j.application_deadline.toISOString(),
      status: j.status,
      applicant_count: j._count.applications,
    })),
  });
});

// POST /api/v1/tpo/jobs/:id/decision
tpoRouter.post("/jobs/:id/decision", async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseResult = jobDecisionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Decision must be ACTIVE, REJECTED, or CLOSED.",
      },
    });
  }

  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!job) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "Job drive not found." },
    });
  }

  const targetStatus = parseResult.data.decision as JobStatus;

  // Strict state machine validation (AppFlow.md §5)
  // PENDING_APPROVAL -> ACTIVE | REJECTED
  // ACTIVE -> CLOSED
  const valid =
    (job.status === JobStatus.PENDING_APPROVAL &&
      (targetStatus === JobStatus.ACTIVE || targetStatus === JobStatus.REJECTED)) ||
    (job.status === JobStatus.ACTIVE && targetStatus === JobStatus.CLOSED);

  if (!valid) {
    return res.status(409).json({
      error: {
        code: "INVALID_TRANSITION",
        message: `Cannot transition job status from ${job.status} to ${targetStatus}.`,
      },
    });
  }

  const updated = await prisma.job.update({
    where: { id },
    data: {
      status: targetStatus,
      decided_by: req.user!.id,
      decided_at: new Date(),
    },
  });

  const auditAction =
    targetStatus === JobStatus.ACTIVE
      ? "JOB_APPROVED"
      : targetStatus === JobStatus.REJECTED
      ? "JOB_REJECTED"
      : "JOB_CLOSED";

  await createAuditLog({
    actorUserId: req.user!.id,
    action: auditAction,
    entityType: "job",
    entityId: job.id,
    metadata: { previous_status: job.status, new_status: targetStatus },
  });

  await notifyUser({
    userId: job.company.user_id,
    type: "JOB_DECISION",
    message: `Your placement drive '${job.title}' is now ${targetStatus}.`,
  });

  res.status(200).json({
    data: {
      id: updated.id,
      title: updated.title,
      status: updated.status,
    },
  });
});
