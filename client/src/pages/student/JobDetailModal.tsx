import React, { useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { evaluateEligibility, type EligibilityResult } from "../../mock/eligibility";
import type { Student, Job, Application } from "../../mock/mockData";
import {
  CheckCircle2,
  AlertCircle,
  FileCheck2,
} from "lucide-react";

interface JobDetailModalProps {
  job: Job | null;
  student: Student;
  applications: Application[];
  onApply: (jobId: string) => void;
  onClose: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  student,
  applications,
  onApply,
  onClose,
}) => {
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  if (!job) return null;

  const eligibility: EligibilityResult = evaluateEligibility(student, job, applications);
  const hasApplied = applications.some(
    (app) => app.job_id === job.id && app.student_id === student.id
  );

  const handleApplyClick = () => {
    setApplying(true);
    setTimeout(() => {
      onApply(job.id);
      setApplying(false);
      setApplySuccess(true);
    }, 400);
  };

  return (
    <Modal
      isOpen={!!job}
      onClose={onClose}
      title={job.title}
      subtitle={job.company_name}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Top Badges & Highlights */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            {eligibility.eligible ? (
              <Badge variant="eligible">Eligible to Apply</Badge>
            ) : hasApplied ? (
              <Badge variant="neutral">Already Applied</Badge>
            ) : (
              <Badge variant="mismatch">Criteria Mismatch</Badge>
            )}
            <span className="text-xs font-mono text-slate-500">
              {job.applicant_count + (applySuccess ? 1 : 0)} Applicants
            </span>
          </div>

          <div className="text-right">
            <span className="text-sm font-bold text-indigo-600 font-mono">{job.ctc_lpa} LPA</span>
            <span className="text-[10px] text-slate-400 block font-sans">Full-Time CTC</span>
          </div>
        </div>

        {/* Eligibility Breakdown Box (Design.md §5.2) */}
        {!eligibility.eligible && !hasApplied && (
          <div className="p-4 rounded-lg bg-red-50/70 border border-red-200 text-xs text-red-900 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Ineligibility Reasons (Rules.md §4.1)</span>
            </div>
            <ul className="space-y-1.5 pl-5 list-disc text-red-700">
              {eligibility.messages.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {hasApplied && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>You have submitted your application for this drive. Check My Applications for updates.</span>
          </div>
        )}

        {/* Criteria Summary Grid */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Drive Requirements
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-md border border-slate-100 bg-slate-50/60">
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Min CGPA</p>
              <p className="font-semibold text-slate-800 mt-0.5">{job.min_cgpa.toFixed(2)}</p>
            </div>
            <div className="p-2.5 rounded-md border border-slate-100 bg-slate-50/60">
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Max Backlogs</p>
              <p className="font-semibold text-slate-800 mt-0.5">{job.max_backlogs}</p>
            </div>
            <div className="p-2.5 rounded-md border border-slate-100 bg-slate-50/60 col-span-2 sm:col-span-1">
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Eligible Depts</p>
              <p className="font-semibold text-slate-800 mt-0.5 font-mono text-[11px]">
                {job.department_codes.join(", ")}
              </p>
            </div>
            <div className="p-2.5 rounded-md border border-slate-100 bg-slate-50/60 col-span-2 sm:col-span-1">
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Deadline</p>
              <p className="font-semibold text-slate-800 mt-0.5 text-[11px]">
                {new Date(job.application_deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Job Description & Role Scope
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-100 p-3.5 rounded-lg whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>

          {eligibility.eligible && !hasApplied && (
            <Button
              variant="primary"
              size="md"
              isLoading={applying}
              onClick={handleApplyClick}
              className="gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Now</span>
            </Button>
          )}

          {!eligibility.eligible && !hasApplied && (
            <Button variant="secondary" size="md" disabled className="opacity-60 cursor-not-allowed">
              <span>Application Disabled (Ineligible)</span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
