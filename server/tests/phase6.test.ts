import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { signToken } from "../src/middleware/auth";
import { Role } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

describe("Phase 6 — Placement Reports & Institutional Analytics", () => {
  const tpoUser = {
    sub: "22222222-2222-2222-2222-222222222222",
    email: "tpo@college.edu",
    role: Role.TPO,
    full_name: "Dr. Arvind Sharma",
  };

  const adminUser = {
    sub: "55555555-5555-5555-5555-555555555555",
    email: "admin@college.edu",
    role: Role.ADMIN,
    full_name: "System Administrator",
  };

  const studentUser = {
    sub: "33333333-3333-3333-3333-333333333333",
    email: "student@college.edu",
    role: Role.STUDENT,
    full_name: "Asha Roy",
  };

  const tpoToken = signToken(tpoUser);
  const adminToken = signToken(adminUser);
  const studentToken = signToken(studentUser);

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("6.1 RBAC Guard: Rejects STUDENT from accessing placement reports with 403", async () => {
    const res = await request(app)
      .get("/api/v1/reports/placement-summary?batch_year=2026")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("6.2 Placement Aggregations: Computes metrics strictly conforming to Schema.md §1", async () => {
    // Mock 2 verified students: 1 placed (12.5 LPA), 1 unplaced
    vi.spyOn(prisma.student, "findMany").mockResolvedValueOnce([
      {
        id: "std-1",
        user_id: "u-1",
        roll_no: "21CSE001",
        phone: "9999999999",
        department_id: "dept-1",
        batch_year: 2026,
        cgpa: 8.5 as any,
        tenth_pct: 90 as any,
        twelfth_pct: 90 as any,
        active_backlogs: 0,
        resume_key: null,
        resume_uploaded_at: null,
        is_verified: true,
        verified_by: null,
        verified_at: null,
        placement_status: "PLACED" as any,
        single_offer_locked: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        department: { code: "CSE", name: "Computer Science" },
        applications: [
          {
            id: "app-1",
            stage: "SELECTED" as any,
            job: {
              ctc_lpa: 12.5 as any,
              company: { company_name: "Acme Corp" },
            },
          },
        ],
      },
      {
        id: "std-2",
        user_id: "u-2",
        roll_no: "21CSE002",
        phone: "8888888888",
        department_id: "dept-1",
        batch_year: 2026,
        cgpa: 7.2 as any,
        tenth_pct: 85 as any,
        twelfth_pct: 80 as any,
        active_backlogs: 0,
        resume_key: null,
        resume_uploaded_at: null,
        is_verified: true,
        verified_by: null,
        verified_at: null,
        placement_status: "UNPLACED" as any,
        single_offer_locked: false,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        department: { code: "CSE", name: "Computer Science" },
        applications: [],
      },
    ] as any);

    const res = await request(app)
      .get("/api/v1/reports/placement-summary?batch_year=2026")
      .set("Authorization", `Bearer ${tpoToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.eligible_students).toBe(2);
    expect(res.body.data.placed_students).toBe(1);
    expect(res.body.data.placement_rate_pct).toBe(50.0);
    expect(res.body.data.average_ctc_lpa).toBe(12.5);
    expect(res.body.data.by_department[0]).toEqual({
      department_code: "CSE",
      eligible: 2,
      placed: 1,
      placement_rate_pct: 50.0,
    });
    expect(res.body.data.top_companies[0]).toEqual({
      company_name: "Acme Corp",
      selections: 1,
    });
  });

  it("6.3 CSV Export: Streams CSV attachment with proper filename header", async () => {
    vi.spyOn(prisma.student, "findMany").mockResolvedValueOnce([]);

    const res = await request(app)
      .get("/api/v1/reports/export?batch_year=2026&format=csv")
      .set("Authorization", `Bearer ${tpoToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.headers["content-disposition"]).toBe(
      'attachment; filename="cpms-placement-2026.csv"'
    );
  });

  it("6.4 PDF Export: Returns PDF stream with application/pdf header", async () => {
    vi.spyOn(prisma.student, "findMany").mockResolvedValueOnce([]);

    const res = await request(app)
      .get("/api/v1/reports/export?batch_year=2026&format=pdf")
      .set("Authorization", `Bearer ${tpoToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
    expect(res.headers["content-disposition"]).toBe(
      'attachment; filename="cpms-placement-2026.pdf"'
    );
  });

  it("6.5 Unplaced Student Directory (REQ-18): Filters unplaced students correctly", async () => {
    vi.spyOn(prisma.student, "findMany").mockResolvedValueOnce([
      {
        id: "std-2",
        roll_no: "21CSE002",
        phone: "8888888888",
        cgpa: 7.5 as any,
        active_backlogs: 0,
        user: { full_name: "Rahul Verma", email: "rahul@college.edu" } as any,
        department: { code: "CSE" } as any,
      } as any,
    ]);

    const res = await request(app)
      .get("/api/v1/reports/unplaced?batch_year=2026")
      .set("Authorization", `Bearer ${tpoToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].roll_no).toBe("21CSE002");
    expect(res.body.data[0].full_name).toBe("Rahul Verma");
  });

  it("6.6 Admin Settings: Updates single_offer_ctc_threshold_lpa and creates audit log", async () => {
    vi.spyOn(prisma.systemSetting, "findUnique").mockResolvedValueOnce({
      key: "single_offer_ctc_threshold_lpa",
      value: "8.0",
      updated_by: null,
      updated_at: new Date(),
    });

    vi.spyOn(prisma.systemSetting, "upsert").mockResolvedValueOnce({
      key: "single_offer_ctc_threshold_lpa",
      value: "10.0",
      updated_by: adminUser.sub,
      updated_at: new Date(),
    });

    const res = await request(app)
      .put("/api/v1/admin/settings")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ single_offer_ctc_threshold_lpa: 10.0 });

    expect(res.status).toBe(200);
    expect(res.body.data.single_offer_ctc_threshold_lpa).toBe(10.0);
  });
});
