import React from "react";
import { Link } from "react-router-dom";
import { useDynamicData } from "../../hooks/useDynamicData";
import { StatCard } from "../../components/ui/StatCard";
import { StageChip } from "../../components/ui/StageChip";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  AlertTriangle,
  Kanban,
} from "lucide-react";

export const CompanyDashboardPage: React.FC = () => {
  const { jobs, applications, companies } = useDynamicData();
  const currentCompany = companies.length > 0 ? companies[0] : null;

  if (!currentCompany) {
    return (
      <div className="space-y-6 text-black dark:text-white max-w-4xl">
        <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-8 sm:p-12 rounded-neo shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-neo bg-[#7DD3FC] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-black">
            <Briefcase className="w-7 h-7" />
          </div>
          <h2 className="font-black text-xl sm:text-2xl uppercase tracking-tight">
            No Corporate Recruiter Profile Found
          </h2>
          <p className="text-xs sm:text-sm font-medium text-black/70 dark:text-white/70 max-w-md mx-auto">
            You are browsing the corporate recruiter portal without an active organization profile. Register your corporate partner profile to post campus drives and review candidate pipelines.
          </p>
          <div className="pt-2">
            <Link
              to="/register/company"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-neo bg-[#7DD3FC] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <span>Register Corporate Partner →</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const companyJobs = jobs.filter(
    (j) => j.company_id === currentCompany.id || j.company_name === currentCompany.company_name
  );
  const totalApplicants = companyJobs.reduce((acc, j) => acc + (j.applicant_count || 0), 0);
  const companyApplications = applications.filter((a) =>
    companyJobs.some((j) => j.id === a.job_id)
  );

  return (
    <div className="space-y-6 text-black dark:text-white">
      {/* TPO Approval Status Banner (AppFlow.md §1) */}
      {currentCompany.status === "PENDING" ? (
        <div className="bg-[#FFE600] border-2 border-black p-4 rounded-neo shadow-[4px_4px_0px_0px_#000] flex items-start justify-between text-black">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-black shrink-0 mt-0.5 stroke-[2.5]" />
            <div>
              <h4 className="text-sm font-black uppercase tracking-wide">Awaiting TPO Corporate Approval</h4>
              <p className="text-xs font-medium text-black/90 mt-0.5">
                Your recruiter registration is currently pending review by the Training & Placement Officer. Drives you draft cannot be published to students until approved.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#86EFAC] border-2 border-black p-3.5 rounded-neo flex items-center justify-between text-xs text-black shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
            <span className="font-bold">
              Verified Corporate Partner · GST ID: <span className="font-mono font-black">{currentCompany.gst_tax_id}</span>
            </span>
          </div>
          <span className="text-[11px] font-mono font-black uppercase bg-black text-white px-2 py-0.5 rounded">
            Approved for 2026 Season
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b-2 border-black dark:border-white">
        <div>
          <h1 className="font-black text-xl sm:text-2xl text-black dark:text-white tracking-tight">
            {currentCompany.company_name} Console
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-1">
            Corporate HR: <span className="font-bold text-black dark:text-white">{currentCompany.contact_person}</span> · Portal Contact: {currentCompany.contact_phone}
          </p>
        </div>

        <Link to="/company/jobs/new">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black text-xs shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Post New Campus Drive</span>
          </button>
        </Link>
      </div>

      {/* KPI StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Drives"
          value={companyJobs.length}
          subtext="1 pending TPO review"
          icon={<Briefcase className="w-4 h-4 text-black dark:text-white" />}
        />
        <StatCard
          label="Total Applicants"
          value={totalApplicants}
          subtext="Across active campus roles"
          icon={<Users className="w-4 h-4 text-black dark:text-white" />}
        />
        <StatCard
          label="Active Pipeline"
          value={companyApplications.length}
          subtext="In review and interview"
          icon={<Clock className="w-4 h-4 text-black dark:text-white" />}
        />
        <StatCard
          label="Final Selections"
          value={companyApplications.filter((a) => a.stage === "SELECTED").length}
          subtext="Offers extended"
          icon={<CheckCircle2 className="w-4 h-4 text-black dark:text-white" />}
        />
      </div>

      {/* Drives Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-black dark:text-white uppercase tracking-wide">
              Corporate Campus Drives
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
              Manage hiring drives and review student applicant funnels
            </p>
          </div>
          <span className="text-xs font-mono font-black text-black dark:text-white bg-[#FFE600] border-2 border-black px-2.5 py-1 rounded shadow-[2px_2px_0px_0px_#000]">
            {companyJobs.length} DRIVES
          </span>
        </div>

        <div className="space-y-3.5">
          {companyJobs.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-neo border-2 border-black dark:border-white p-8 text-center shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] space-y-3">
              <p className="text-sm font-black text-black dark:text-white uppercase tracking-wide">
                No Campus Hiring Drives Created Yet
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono max-w-md mx-auto">
                Submit your first campus recruitment drive with CTC packages, branch eligibility, and applicant cutoffs to begin intake.
              </p>
              <div className="pt-2">
                <Link
                  to="/company/jobs/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black text-xs shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Post Campus Drive</span>
                </Link>
              </div>
            </div>
          ) : (
            companyJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-zinc-900 rounded-neo border-2 border-black dark:border-white p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#fff] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-black text-base text-black dark:text-white">{job.title}</h3>
                  <StageChip stage={job.status} size="sm" />
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2 font-mono flex-wrap">
                  <span className="font-black bg-[#FFE600] text-black px-1.5 py-0.5 rounded border border-black text-[11px]">
                    ₹{job.ctc_lpa} LPA
                  </span>
                  <span>·</span>
                  <span>Min CGPA: <strong>{job.min_cgpa.toFixed(1)}</strong></span>
                  <span>·</span>
                  <span>Eligible: <strong>{job.department_codes.join(", ")}</strong></span>
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  Deadline: {new Date(job.application_deadline).toLocaleDateString()} · {job.applicant_count} registered candidates
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link to={`/company/jobs/${job.id}`}>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-neo bg-[#7DD3FC] text-black border-2 border-black font-black text-xs shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                  >
                    <Kanban className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>View Kanban Funnel</span>
                  </button>
                </Link>
                <Link to={`/company/jobs/${job.id}`}>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-neo bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white font-black text-xs shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                  >
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
};

export default CompanyDashboardPage;
