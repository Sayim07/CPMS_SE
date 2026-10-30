import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { signToken } from "../src/middleware/auth";
import { Role, CompanyStatus, JobStatus } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { closeExpiredJobs } from "../src/jobs/closeExpiredJobs";

describe("Phase 3 — Companies & Job Postings", () => {
  const companyUser = {
    sub: "11111111-1111-1111-1111-111111111111",
    email: "hr@acme.com",
    role: Role.COMPANY,
    full_name: "Ravi Menon",
  };

  const tpoUser = {
    sub: "22222222-2222-2222-2222-222222222222",
    email: "tpo@college.edu",
    role: Role.TPO,
    full_name: "Dr. Arvind Sharma",
  };

  const studentUser = {
    sub: "33333333-3333-3333-3333-333333333333",
    email: "student@college.edu",
    role: Role.STUDENT,
    full_name: "Asha Roy",
  };

  const companyToken = signToken(companyUser);
  const tpoToken = signToken(tpoUser);
  const studentToken = signToken(studentUser);

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("3.1 Auth Guard: Rejects unauthenticated request to POST /api/v1/jobs with 401", async () => {
    const res = await request(app).post("/api/v1/jobs").send({});
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("3.2 Role Guard: Rejects STUDENT from posting a job with 403 FORBIDDEN", async () => {
    const res = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        title: "Software Engineer",
        description: "Backend role",
        ctc_lpa: 12.0,
        min_cgpa: 7.0,
        max_backlogs: 0,
        department_ids: ["44444444-4444-4444-4444-444444444444"],
        application_deadline: new Date(Date.now() + 86400000).toISOString(),
      });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("3.3 Company Approval Guard: Rejects PENDING company with 403 COMPANY_NOT_APPROVED", async () => {
    vi.spyOn(prisma.company, "findUnique").mockResolvedValueOnce({
      id: "comp-001",
      user_id: companyUser.sub,
      company_name: "Acme Corp",
      website: "https://acme.com",
      gst_tax_id: "GST1234",
      contact_phone: "9876543210",
      status: CompanyStatus.PENDING,
      decided_by: null,
      decided_at: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    });

    const res = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${companyToken}`)
      .send({
        title: "Software Engineer",
        description: "Backend role",
        ctc_lpa: 12.0,
        min_cgpa: 7.0,
        max_backlogs: 0,
        department_ids: ["44444444-4444-4444-4444-444444444444"],
        application_deadline: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("COMPANY_NOT_APPROVED");
  });

  it("3.4 Validation: Rejects past application deadline with 400 VALIDATION_ERROR", async () => {
    const res = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${companyToken}`)
      .send({
        title: "Software Engineer",
        description: "Backend role",
        ctc_lpa: 12.0,
        min_cgpa: 7.0,
        max_backlogs: 0,
        department_ids: ["44444444-4444-4444-4444-444444444444"],
        application_deadline: new Date(Date.now() - 86400000).toISOString(),
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("3.5 State Machine: Rejects invalid status transition (ACTIVE -> REJECTED) with 409", async () => {
    vi.spyOn(prisma.job, "findUnique").mockResolvedValueOnce({
      id: "job-001",
      company_id: "comp-001",
      title: "Backend Dev",
      description: "Node.js role",
      ctc_lpa: 14 as any,
      min_cgpa: 7.5 as any,
      max_backlogs: 0,
      application_deadline: new Date(Date.now() + 86400000),
      status: JobStatus.ACTIVE,
      decided_by: null,
      decided_at: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      company: { user_id: companyUser.sub, company_name: "Acme" },
    } as any);

    const res = await request(app)
      .post("/api/v1/tpo/jobs/job-001/decision")
      .set("Authorization", `Bearer ${tpoToken}`)
      .send({ decision: "REJECTED" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("INVALID_TRANSITION");
  });

  it("3.6 Deadline Auto-Close (REQ-9): closeExpiredJobs updates expired active drives", async () => {
    const updateManySpy = vi.spyOn(prisma.job, "updateMany").mockResolvedValueOnce({
      count: 3,
    });

    const closedCount = await closeExpiredJobs();
    expect(closedCount).toBe(3);
    expect(updateManySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: JobStatus.ACTIVE,
        }),
        data: {
          status: JobStatus.CLOSED,
        },
      })
    );
  });
});
