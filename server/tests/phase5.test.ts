import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { signToken } from "../src/middleware/auth";
import { Role, ApplicationStage, PlacementStatus } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

describe("Phase 5 — Funnel, Rounds & Notifications", () => {
  const studentUser = {
    sub: "11111111-1111-1111-1111-111111111111",
    email: "aakriti.student@college.edu",
    role: Role.STUDENT,
    full_name: "Aakriti Sharma",
  };

  const otherStudentUser = {
    sub: "22222222-2222-2222-2222-222222222222",
    email: "other@college.edu",
    role: Role.STUDENT,
    full_name: "Other Student",
  };

  const companyUser = {
    sub: "33333333-3333-3333-3333-333333333333",
    email: "recruiter@techcorp.com",
    role: Role.COMPANY,
    full_name: "HR Lead",
  };

  const studentToken = signToken(studentUser);
  const otherStudentToken = signToken(otherStudentUser);
  const companyToken = signToken(companyUser);

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("5.1 Auth Guard: Rejects unauthenticated GET /api/v1/notifications with 401", async () => {
    const res = await request(app).get("/api/v1/notifications");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("5.2 Notification Feed: Returns notifications for logged-in user with unread_count", async () => {
    const mockNotifications = [
      {
        id: "notif-1",
        user_id: studentUser.sub,
        type: "ROUND_SCHEDULED",
        message: "Interview round scheduled",
        link_path: "/student/applications",
        read_at: null,
        created_at: new Date("2026-11-01T10:00:00Z"),
      },
      {
        id: "notif-2",
        user_id: studentUser.sub,
        type: "APPLICATION_SHORTLISTED",
        message: "You have been shortlisted",
        link_path: "/student/applications",
        read_at: new Date("2026-11-01T11:00:00Z"),
        created_at: new Date("2026-11-01T09:00:00Z"),
      },
    ];

    vi.spyOn(prisma.notification, "findMany").mockResolvedValue(mockNotifications as any);
    vi.spyOn(prisma.notification, "count").mockResolvedValue(1);

    const res = await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].id).toBe("notif-1");
    expect(res.body.meta.unread_count).toBe(1);
  });

  it("5.3 Single Read: Marks notification as read", async () => {
    vi.spyOn(prisma.notification, "findUnique").mockResolvedValue({
      id: "notif-1",
      user_id: studentUser.sub,
    } as any);

    vi.spyOn(prisma.notification, "update").mockResolvedValue({
      id: "notif-1",
      read_at: new Date(),
    } as any);

    const res = await request(app)
      .patch("/api/v1/notifications/notif-1/read")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe("notif-1");
    expect(res.body.data.message).toBe("Notification marked as read.");
  });

  it("5.4 Forbidden Single Read: Cannot mark another user's notification as read", async () => {
    vi.spyOn(prisma.notification, "findUnique").mockResolvedValue({
      id: "notif-1",
      user_id: otherStudentUser.sub, // owned by someone else
    } as any);

    const res = await request(app)
      .patch("/api/v1/notifications/notif-1/read")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("5.5 Mark All Read: Updates all unread notifications for the user", async () => {
    vi.spyOn(prisma.notification, "updateMany").mockResolvedValue({ count: 4 } as any);

    const res = await request(app)
      .patch("/api/v1/notifications/read-all")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.updated_count).toBe(4);
    expect(res.body.data.message).toBe("All notifications marked as read.");
  });

  it("5.6 Privacy by Design: Masks student email/phone for APPLIED stage when viewed by COMPANY", async () => {
    vi.spyOn(prisma.job, "findUnique").mockResolvedValue({
      id: "job-1",
      company: { user_id: companyUser.sub },
    } as any);

    const mockApplications = [
      {
        id: "app-1",
        stage: ApplicationStage.APPLIED,
        applied_at: new Date("2026-11-01T10:00:00Z"),
        student: {
          id: "student-1",
          roll_no: "21CSE001",
          cgpa: 8.5,
          active_backlogs: 0,
          phone: "9876543210",
          user: { full_name: "Rahul Verma", email: "rahul@college.edu" },
          department: { code: "CSE" },
        },
      },
      {
        id: "app-2",
        stage: ApplicationStage.SHORTLISTED,
        applied_at: new Date("2026-11-01T10:30:00Z"),
        student: {
          id: "student-2",
          roll_no: "21CSE002",
          cgpa: 9.1,
          active_backlogs: 0,
          phone: "9876543211",
          user: { full_name: "Pooja Hegde", email: "pooja@college.edu" },
          department: { code: "CSE" },
        },
      },
    ];

    vi.spyOn(prisma.application, "findMany").mockResolvedValue(mockApplications as any);

    const res = await request(app)
      .get("/api/v1/jobs/job-1/applications")
      .set("Authorization", `Bearer ${companyToken}`);

    expect(res.status).toBe(200);
    // Stage APPLIED: email and phone MUST be null for company
    expect(res.body.data[0].student.email).toBeNull();
    expect(res.body.data[0].student.phone).toBeNull();
    // Stage SHORTLISTED: contact info revealed
    expect(res.body.data[1].student.email).toBe("pooja@college.edu");
    expect(res.body.data[1].student.phone).toBe("9876543211");
  });

  it("5.7 State Machine: Rejects invalid stage transition with 409 INVALID_TRANSITION", async () => {
    vi.spyOn(prisma.application, "findUnique").mockResolvedValue({
      id: "app-1",
      stage: ApplicationStage.APPLIED,
      job: { company: { user_id: companyUser.sub } },
      student: { user: { id: studentUser.sub } },
    } as any);

    // APPLIED -> SELECTED is illegal (must go through SHORTLISTED -> IN_INTERVIEW -> SELECTED)
    const res = await request(app)
      .patch("/api/v1/applications/app-1/stage")
      .set("Authorization", `Bearer ${companyToken}`)
      .send({ stage: ApplicationStage.SELECTED });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("INVALID_TRANSITION");
  });

  it("5.8 Interview Rounds: Creates round and notifies shortlisted candidates", async () => {
    vi.spyOn(prisma.job, "findUnique").mockResolvedValue({
      id: "job-1",
      title: "Frontend Architect",
      company: { user_id: companyUser.sub },
    } as any);

    vi.spyOn(prisma.interviewRound, "create").mockResolvedValue({
      id: "round-1",
      round_name: "Technical Assessment",
      scheduled_at: new Date("2026-11-10T10:00:00Z"),
      venue_or_link: "https://meet.google.com/xyz",
    } as any);

    vi.spyOn(prisma.application, "findMany").mockResolvedValue([
      { student: { user_id: studentUser.sub } },
    ] as any);

    const notifySpy = vi.spyOn(prisma.notification, "createMany").mockResolvedValue({ count: 1 });

    const res = await request(app)
      .post("/api/v1/jobs/job-1/rounds")
      .set("Authorization", `Bearer ${companyToken}`)
      .send({
        round_name: "Technical Assessment",
        scheduled_at: "2026-11-10T10:00:00.000Z",
        venue_or_link: "https://meet.google.com/xyz",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.round_name).toBe("Technical Assessment");
    expect(res.body.data.notified_candidates).toBe(1);
    expect(notifySpy).toHaveBeenCalled();
  });
});

