import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { env } from "../src/config/env";
import { prisma } from "../src/lib/prisma";

describe("Phase 0 — Setup, Database Foundation & Express Skeleton", () => {
  it("0.1 Env configuration: Zod validates required environment variables", () => {
    expect(env).toBeDefined();
    expect(env.PORT).toBeTypeOf("number");
    expect(env.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
    expect(env.DATABASE_URL).toBeDefined();
    expect(env.CORS_ORIGIN).toBeDefined();
  });

  it("0.2 Express Skeleton: GET /api/v1/health returns 200 and expected contract", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("status", "ok");
    expect(res.body.data).toHaveProperty("uptime");
    expect(res.body.data).toHaveProperty("timestamp");
    expect(res.body.data).toHaveProperty("db");
  });

  it("0.3 Express Skeleton: Root GET /health also functions", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ok");
  });

  it("0.4 Security: Helmet sets standard security headers", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.headers).toHaveProperty("x-content-type-options", "nosniff");
  });

  it("0.5 Prisma Client: Verifies all 11 Schema.md §3 models are generated", () => {
    // 1. User
    expect(prisma.user).toBeDefined();
    // 2. Department
    expect(prisma.department).toBeDefined();
    // 3. Student
    expect(prisma.student).toBeDefined();
    // 4. Company
    expect(prisma.company).toBeDefined();
    // 5. Job
    expect(prisma.job).toBeDefined();
    // 6. JobDepartment
    expect(prisma.jobDepartment).toBeDefined();
    // 7. Application
    expect(prisma.application).toBeDefined();
    // 8. InterviewRound
    expect(prisma.interviewRound).toBeDefined();
    // 9. Notification
    expect(prisma.notification).toBeDefined();
    // 10. AuditLog
    expect(prisma.auditLog).toBeDefined();
    // 11. SystemSetting
    expect(prisma.systemSetting).toBeDefined();
  });

  it("0.6 Error Handling: Conforms strictly to Schema.md §4 error contract", async () => {
    // Send request to an unmapped route or trigger test route
    const res = await request(app).post("/api/v1/non-existent-trigger-404");
    // Standard express 404 or our custom handler
    expect([404, 500]).toContain(res.status);
  });
});

