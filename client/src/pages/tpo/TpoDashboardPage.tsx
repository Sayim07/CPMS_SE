import React from "react";
import { Link } from "react-router-dom";
import { StatCard } from "../../components/ui/StatCard";
import { Button } from "../../components/ui/Button";
import {
  MOCK_STUDENTS,
  MOCK_COMPANIES,
  MOCK_JOBS,
} from "../../mock/mockData";
import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export const TpoDashboardPage: React.FC = () => {
  const pendingStudents = MOCK_STUDENTS.filter((s) => !s.is_verified);
  const pendingCompanies = MOCK_COMPANIES.filter((c) => c.status === "PENDING");
  const pendingJobs = MOCK_JOBS.filter((j) => j.status === "PENDING_APPROVAL");
  const activeJobs = MOCK_JOBS.filter((j) => j.status === "ACTIVE");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Training & Placement Office (TPO) Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional Placement Season 2026 · Batch: B.Tech 2022–2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/tpo/reports">
            <Button variant="secondary" size="sm">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              Institutional Reports
            </Button>
          </Link>
          <Link to="/tpo/students">
            <Button variant="primary" size="sm">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Verification Queue ({pendingStudents.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Verification Queues (Linear-style Alert Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Student Verification Queue */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-md bg-amber-50 text-amber-700">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              {pendingStudents.length} Action Needed
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mt-3">Student Verifications</h3>
          <p className="text-xs text-slate-500 mt-1">
            Registered students pending academic criteria & marksheet verification.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">REQ-5 Governance</span>
            <Link
              to="/tpo/students"
              className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 group"
            >
              Review queue <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Corporate Partner Approval Queue */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-md bg-indigo-50 text-indigo-700">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
              {pendingCompanies.length} Corporate
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mt-3">Recruiter Registrations</h3>
          <p className="text-xs text-slate-500 mt-1">
            Corporate accounts awaiting GST/tax verification and university approval.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">REQ-2 Governance</span>
            <Link
              to="/tpo/approvals"
              className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 group"
            >
              Verify partners <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Job Drive Approval Queue */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-md bg-emerald-50 text-emerald-700">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {pendingJobs.length} Pending Drive
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mt-3">Job Drive Approvals</h3>
          <p className="text-xs text-slate-500 mt-1">
            Recruiter postings awaiting eligibility parameter confirmation.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">REQ-6 Governance</span>
            <Link
              to="/tpo/approvals"
              className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 group"
            >
              Approve drives <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core Placement KPI StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Placement Rate"
          value="78.4%"
          subtext="120 eligible students in 2026 batch"
          icon={<Award className="w-4 h-4 text-emerald-600" />}
          trend={{ value: "+4.2% YoY", isPositive: true }}
        />
        <StatCard
          label="Average CTC Package"
          value="9.4 LPA"
          subtext="Median package: 8.2 LPA"
          icon={<TrendingUp className="w-4 h-4 text-indigo-600" />}
          trend={{ value: "+0.8 LPA", isPositive: true }}
        />
        <StatCard
          label="Highest Offered CTC"
          value="24.0 LPA"
          subtext="Cloud & AI Research role"
          icon={<Briefcase className="w-4 h-4 text-sky-600" />}
        />
        <StatCard
          label="Active Drives Live"
          value={`${activeJobs.length} Drives`}
          subtext="Across 4 academic departments"
          icon={<Users className="w-4 h-4 text-amber-600" />}
        />
      </div>

      {/* Recent Drives and Direct Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Campus Drives */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Current Placement Drives</h2>
              <p className="text-xs text-slate-500">Live recruitment cycles in progress</p>
            </div>
            <Link to="/tpo/approvals" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
              Manage all drives →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {MOCK_JOBS.map((job) => (
              <div key={job.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{job.title}</span>
                    {job.status === "ACTIVE" ? (
                      <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-amber-50 text-amber-700 border border-amber-200">
                        Pending Approval
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-3">
                    <span>{job.company_name}</span>
                    <span>·</span>
                    <span className="font-mono font-medium text-slate-700">{job.ctc_lpa.toFixed(1)} LPA</span>
                    <span>·</span>
                    <span>Min CGPA {job.min_cgpa.toFixed(1)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">
                    {job.applicant_count} applicants
                  </span>
                  <Link to={`/company/jobs/${job.id}`}>
                    <Button variant="ghost" size="sm">
                      Inspect
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Policy & Single Offer Notice */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Institutional Governance</h2>
            <p className="text-xs text-slate-500">Enforced by Rules.md §4.1</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-900">
                <span>Single Offer Threshold</span>
                <span className="font-mono text-indigo-700 font-bold">8.0 LPA</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Students with offers under 8.0 LPA remain eligible for "Dream" drives offering &gt;8.0 LPA.
              </p>
            </div>

            <div className="p-3 rounded-md bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Verification Invalidation</span>
              </div>
              <p className="text-[11px] text-amber-800">
                When a student updates their CGPA or backlog count, their profile is automatically flagged unverified until re-checked by TPO.
              </p>
            </div>

            <div className="p-3 rounded-md bg-indigo-50/50 border border-indigo-200/50 text-xs text-indigo-900 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <Clock className="w-4 h-4 text-indigo-700" />
                <span>Drive Deadline Enforcement</span>
              </div>
              <p className="text-[11px] text-indigo-800">
                Application deadlines are strictly locked to the second. No late submissions can bypass database rule constraints.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
