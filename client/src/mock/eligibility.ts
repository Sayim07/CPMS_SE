import type { Student, Job, Application } from "./mockData";

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
  messages: string[];
}

/**
 * Client mirror of evaluateEligibility() conforming strictly to Schema.md §1.
 * Evaluates all rules without short-circuiting so all rejection reasons are returned.
 */
export function evaluateEligibility(
  student: Student,
  job: Job,
  applications: Application[] = [],
  singleOfferThreshold: number = 8.0,
  now: Date = new Date()
): EligibilityResult {
  const reasons: string[] = [];
  const messages: string[] = [];

  // 1. TPO Verification Check
  if (!student.is_verified) {
    reasons.push("NOT_VERIFIED");
    messages.push("Your profile is not verified by the TPO yet.");
  }

  // 2. Department Cutoff Check
  if (!job.department_codes.includes(student.department_code)) {
    reasons.push("DEPT_NOT_ALLOWED");
    messages.push(`Your department (${student.department_code}) is not eligible for this drive.`);
  }

  // 3. CGPA Cutoff Check
  if (student.cgpa < job.min_cgpa) {
    reasons.push("CGPA_BELOW_CUTOFF");
    messages.push(`Your CGPA ${student.cgpa.toFixed(2)} is below the required ${job.min_cgpa.toFixed(2)}.`);
  }

  // 4. Backlogs Check
  if (student.active_backlogs > job.max_backlogs) {
    reasons.push("BACKLOGS_EXCEEDED");
    messages.push(
      `You have ${student.active_backlogs} active backlog(s); maximum allowed is ${job.max_backlogs}.`
    );
  }

  // 5. Job Status Check
  if (job.status !== "ACTIVE") {
    reasons.push("JOB_NOT_ACTIVE");
    messages.push("This drive is not currently active.");
  }

  // 6. Application Deadline Check
  const deadline = new Date(job.application_deadline);
  if (deadline.getTime() <= now.getTime()) {
    reasons.push("DEADLINE_PASSED");
    messages.push("The application deadline has passed.");
  }

  // 7. Single Offer Policy Lock Check
  if (student.single_offer_locked && job.ctc_lpa <= singleOfferThreshold) {
    reasons.push("SINGLE_OFFER_LOCK");
    messages.push(
      `You are locked out of standard-tier drives (≤ ${singleOfferThreshold} LPA) after securing a high-tier offer.`
    );
  }

  // 8. Duplicate Application Check
  const hasApplied = applications.some(
    (app) => app.job_id === job.id && app.student_id === student.id
  );
  if (hasApplied) {
    reasons.push("ALREADY_APPLIED");
    messages.push("You have already applied for this placement drive.");
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    messages,
  };
}
