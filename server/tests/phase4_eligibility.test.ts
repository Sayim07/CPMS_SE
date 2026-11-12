import { describe, it, expect } from "vitest";
import { evaluateEligibility } from "../src/services/eligibility";
import { JobStatus, PlacementStatus } from "@prisma/client";

describe("Phase 4 — Deterministic Eligibility Engine (Schema.md §1 & Rules.md)", () => {
  const baseStudent: any = {
    id: "std-100",
    user_id: "usr-100",
    roll_no: "21CSE001",
    department_id: "dept-cse",
    cgpa: 8.5,
    active_backlogs: 0,
    is_verified: true,
    single_offer_locked: false,
    placement_status: PlacementStatus.UNPLACED,
    applications: [],
  };

  const baseJob: any = {
    id: "job-100",
    title: "Software Development Engineer",
    ctc_lpa: 12.0,
    min_cgpa: 7.0,
    max_backlogs: 0,
    status: JobStatus.ACTIVE,
    application_deadline: new Date(Date.now() + 86400000), // tomorrow
    job_departments: [{ department_id: "dept-cse" }],
  };

  const settings = { single_offer_ctc_threshold_lpa: 6.0 };

  it("4.1 Returns eligible=true when student satisfies all criteria", () => {
    const res = evaluateEligibility(baseStudent, baseJob, settings);
    expect(res.eligible).toBe(true);
    expect(res.reasons).toEqual([]);
  });

  it("4.2 Flags NOT_VERIFIED if student is not verified by TPO", () => {
    const student = { ...baseStudent, is_verified: false };
    const res = evaluateEligibility(student, baseJob, settings);
    expect(res.eligible).toBe(false);
    expect(res.reasons).toContain("NOT_VERIFIED");
  });

  it("4.3 Flags DEPT_NOT_ALLOWED if student department is not in job departments", () => {
    const student = { ...baseStudent, department_id: "dept-mech" };
    const res = evaluateEligibility(student, baseJob, settings);
    expect(res.eligible).toBe(false);
    expect(res.reasons).toContain("DEPT_NOT_ALLOWED");
  });

  it("4.4 Flags CGPA_BELOW_CUTOFF if student CGPA < min_cgpa", () => {
    const student = { ...baseStudent, cgpa: 6.5 };
    const res = evaluateEligibility(student, baseJob, settings);
    expect(res.eligible).toBe(false);
    expect(res.reasons).toContain("CGPA_BELOW_CUTOFF");
  });

  it("4.5 Flags BACKLOGS_EXCEEDED if student active_backlogs > max_backlogs", () => {
    const student = { ...baseStudent, active_backlogs: 2 };
    const res = evaluateEligibility(student, baseJob, settings);
    expect(res.eligible).toBe(false);
    expect(res.reasons).toContain("BACKLOGS_EXCEEDED");
  });

  it("4.6 Flags JOB_NOT_ACTIVE if job status is not ACTIVE", () => {
    const job = { ...baseJob, status: JobStatus.PENDING_APPROVAL };
    const res = evaluateEligibility(baseStudent, job, settings);
    expect(res.eligible).toBe(false);
    expect(res.reasons).toContain("JOB_NOT_ACTIVE");
  });

  it("4.7 Flags DEADLINE_PASSED if application_deadline has passed", () => {
    const job = { ...baseJob, application_deadline: new Date(Date.now() - 3600000) }; // 1h ago
    const res = evaluateEligibility(baseStudent, job, settings);
    expect(res.eligible).toBe(false);
    expect(res.reasons).toContain("DEADLINE_PASSED");
  });

  it("4.8 Flags SINGLE_OFFER_LOCK (BR-1) if student is locked and job CTC <= threshold", () => {
    const student = { ...baseStudent, single_offer_locked: true };
    const job = { ...baseJob, ctc_lpa: 5.5 }; // below 6.0 threshold
    const res = evaluateEligibility(student, job, settings);
    expect(res.eligible).toBe(false);
    expect(res.reasons).toContain("SINGLE_OFFER_LOCK");
  });

  it("4.9 Allows student with SINGLE_OFFER_LOCK to apply for dream-tier drive (CTC > threshold)", () => {
    const student = { ...baseStudent, single_offer_locked: true };
    const job = { ...baseJob, ctc_lpa: 14.0 }; // above 6.0 threshold
    const res = evaluateEligibility(student, job, settings);
    expect(res.eligible).toBe(true);
    expect(res.reasons).not.toContain("SINGLE_OFFER_LOCK");
  });

  it("4.10 Flags ALREADY_APPLIED if student has already applied to the job", () => {
    const student = { ...baseStudent, applications: [{ job_id: "job-100" }] };
    const res = evaluateEligibility(student, baseJob, settings);
    expect(res.eligible).toBe(false);
    expect(res.reasons).toContain("ALREADY_APPLIED");
  });

  it("4.11 Returns MULTIPLE failure reasons without short-circuiting", () => {
    const student = {
      ...baseStudent,
      is_verified: false,
      cgpa: 5.0,
      active_backlogs: 3,
      department_id: "dept-civil",
    };
    const job = {
      ...baseJob,
      status: JobStatus.CLOSED,
      application_deadline: new Date(Date.now() - 100000),
    };

    const res = evaluateEligibility(student, job, settings);
    expect(res.eligible).toBe(false);
    expect(res.reasons).toContain("NOT_VERIFIED");
    expect(res.reasons).toContain("CGPA_BELOW_CUTOFF");
    expect(res.reasons).toContain("BACKLOGS_EXCEEDED");
    expect(res.reasons).toContain("DEPT_NOT_ALLOWED");
    expect(res.reasons).toContain("JOB_NOT_ACTIVE");
    expect(res.reasons).toContain("DEADLINE_PASSED");
    expect(res.reasons.length).toBe(6);
  });
});

