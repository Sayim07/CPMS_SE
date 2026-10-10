import React from "react";
import { Link } from "react-router-dom";
import { StatCard } from "../../components/ui/StatCard";
import { StageChip } from "../../components/ui/StageChip";
import { Button } from "../../components/ui/Button";
import {
  MOCK_JOBS,
  MOCK_APPLICATIONS,
  MOCK_COMPANIES,
} from "../../mock/mockData";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export const CompanyDashboardPage: React.FC = () => {
  const currentCompany = MOCK_COMPANIES[0]; // Acme Technologies

  const companyJobs = MOCK_JOBS.filter((j) => j.company_id === currentCompany.id);
  const totalApplicants = companyJobs.reduce((acc, j) => acc + j.applicant_count, 0);

  return (
    <div className="space-y-6">
      {/* TPO Approval Status Banner (AppFlow.md §1) */}
      {currentCompany.status === "PENDING" ? (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md flex items-start justify-between shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">Awaiting TPO Corporate Approval</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Your recruiter registration is currently pending review by the Training & Placement Officer. Drives you draft cannot be published to students until approved.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3.5 rounded-r-md flex items-center justify-between text-xs text-emerald-900 shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              Verified Corporate Partner · GST ID: <span className="font-mono">{currentCompany.gst_tax_id}</span>
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">Approved for 2026 Season</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{currentCompany.company_name} Console</h1>
          <p className="text-xs text-slate-500 mt-1">
            Corporate HR: <span className="font-medium text-slate-700">{currentCompany.contact_person}</span> · Portal Contact: {currentCompany.contact_phone}
          </p>
        </div>

        <Link to="/company/jobs/new">
          <Button variant="primary" size="md" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Post New Campus Drive</span>
          </Button>
        </Link>
      </div>

      {/* KPI StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Drives"
          value={companyJobs.length}
          subtext="1 pending TPO review"
          icon={<Briefcase className="w-4 h-4 text-indigo-600" />}
        />
        <StatCard
          label="Total Applicants"
          value={totalApplicants}
          subtext="Across active campus roles"
          icon={<Users className="w-4 h-4 text-emerald-600" />}
        />
        <StatCard
          label="Active Pipeline"
          value={MOCK_APPLICATIONS.length}
          subtext="In review and interview"
          icon={<Clock className="w-4 h-4 text-sky-600" />}
        />
        <StatCard
          label="Final Selections"
          value={MOCK_APPLICATIONS.filter((a) => a.stage === "SELECTED").length}
          subtext="Offers extended"
          icon={<CheckCircle2 className="w-4 h-4 text-amber-600" />}
        />
      </div>

      {/* Drives Directory */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Corporate Campus Drives</h2>
            <p className="text-xs text-slate-500">Manage hiring drives and review student applicant funnels</p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
            {companyJobs.length} Drives
          </span>
        </div>

        <div className="space-y-3">
          {companyJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-semibold text-sm text-slate-900">{job.title}</h3>
                  <StageChip stage={job.status} size="sm" />
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="font-mono font-semibold text-indigo-600">{job.ctc_lpa} LPA</span>
                  <span>·</span>
                  <span>Min CGPA: {job.min_cgpa.toFixed(1)}</span>
                  <span>·</span>
                  <span>Eligible: {job.department_codes.join(", ")}</span>
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Deadline: {new Date(job.application_deadline).toLocaleDateString()} · {job.applicant_count} registered candidates
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link to={`/company/jobs/${job.id}`}>
                  <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Kanban Funnel</span>
                  </Button>
                </Link>
                <Link to={`/company/jobs/${job.id}`}>
                  <Button variant="primary" size="sm" className="gap-1 text-xs">
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
