import { Job, Student, JobStatus } from "@prisma/client";

export type ReasonCode =
  | "NOT_VERIFIED"
  | "DEPT_NOT_ALLOWED"
  | "CGPA_BELOW_CUTOFF"
  | "BACKLOGS_EXCEEDED"
  | "JOB_NOT_ACTIVE"
  | "DEADLINE_PASSED"
  | "SINGLE_OFFER_LOCK"
  | "ALREADY_APPLIED";

export interface SystemSettingsSnapshot {
  single_offer_ctc_threshold_lpa: number;
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: ReasonCode[];
}

export interface JobWithDepartments extends Job {
  job_departments?: { department_id: string }[];
}

export interface StudentWithApplications extends Student {
  applications?: { job_id: string }[];
}

/**
 * Deterministic Eligibility Engine conforming strictly to Schema.md §1 & Rules.md.
 * Returns { eligible: boolean, reasons: ReasonCode[] }.
 * All applicable reasons are returned (no short-circuit).
 */
export function evaluateEligibility(
  student: StudentWithApplications,
  job: JobWithDepartments,
  settings: SystemSettingsSnapshot = { single_offer_ctc_threshold_lpa: 6.0 },
  now: Date = new Date(),
  alreadyAppliedOverride?: boolean
): EligibilityResult {
  const reasons: ReasonCode[] = [];

  // 1. Verification rule: student must be verified by TPO
  if (!student.is_verified) {
    reasons.push("NOT_VERIFIED");
  }

  // 2. Department rule: student department must be among job departments (if specified)
  if (job.job_departments && job.job_departments.length > 0) {
    const allowedDeptIds = job.job_departments.map((d) => d.department_id);
    if (!allowedDeptIds.includes(student.department_id)) {
      reasons.push("DEPT_NOT_ALLOWED");
    }
  }

  // 3. CGPA cutoff rule: student CGPA must be >= job min_cgpa
  if (Number(student.cgpa) < Number(job.min_cgpa)) {
    reasons.push("CGPA_BELOW_CUTOFF");
  }

  // 4. Backlog cutoff rule: student active backlogs must be <= job max_backlogs
  if (student.active_backlogs > job.max_backlogs) {
    reasons.push("BACKLOGS_EXCEEDED");
  }

  // 5. Job status rule: job must be ACTIVE
  if (job.status !== JobStatus.ACTIVE) {
    reasons.push("JOB_NOT_ACTIVE");
  }

  // 6. Application deadline rule: deadline must be strictly in the future
  if (new Date(job.application_deadline).getTime() <= now.getTime()) {
    reasons.push("DEADLINE_PASSED");
  }

  // 7. Single Offer Lock rule (BR-1): if student has single offer lock, they cannot apply
  // for drives with CTC <= single_offer_ctc_threshold_lpa
  if (
    student.single_offer_locked &&
    Number(job.ctc_lpa) <= settings.single_offer_ctc_threshold_lpa
  ) {
    reasons.push("SINGLE_OFFER_LOCK");
  }

  // 8. Already applied rule: cannot reapply to the same job
  const hasApplied =
    alreadyAppliedOverride !== undefined
      ? alreadyAppliedOverride
      : (student.applications || []).some((app) => app.job_id === job.id);

  if (hasApplied) {
    reasons.push("ALREADY_APPLIED");
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

