import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/lib/prisma";

describe("Phase 1 — Reference Catalog & Department Data", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("1.1 Public Access: GET /api/v1/departments succeeds without an authentication token", async () => {
    vi.spyOn(prisma.department, "findMany").mockResolvedValue([
      { id: "dept-1", code: "CSE", name: "Computer Science and Engineering" },
      { id: "dept-2", code: "ECE", name: "Electronics and Communication Engineering" },
      { id: "dept-3", code: "IT", name: "Information Technology" },
      { id: "dept-4", code: "MECH", name: "Mechanical Engineering" },
    ] as any);

    const res = await request(app).get("/api/v1/departments");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveLength(4);
    expect(res.body.data[0]).toEqual({
      id: "dept-1",
      code: "CSE",
      name: "Computer Science and Engineering",
    });
  });

  it("1.2 Filtering: Queries only active departments (is_active = true) ordered by code asc", async () => {
    const findManySpy = vi.spyOn(prisma.department, "findMany").mockResolvedValue([] as any);

    await request(app).get("/api/v1/departments");

    expect(findManySpy).toHaveBeenCalledWith({
      where: { is_active: true },
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: { code: "asc" },
    });
  });

  it("1.3 Error Contract: Returns 500 with standard error object on database error", async () => {
    vi.spyOn(prisma.department, "findMany").mockRejectedValue(new Error("Database disconnected"));

    const res = await request(app).get("/api/v1/departments");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toHaveProperty("code", "INTERNAL_ERROR");
    expect(res.body.error).toHaveProperty("message");
  });
});

