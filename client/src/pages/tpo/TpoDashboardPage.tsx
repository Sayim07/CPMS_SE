import React from "react";
import { Link } from "react-router-dom";
import { useDynamicData } from "../../hooks/useDynamicData";
import { StatCard } from "../../components/ui/StatCard";
import { Button } from "../../components/ui/Button";
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
  const { students, companies, jobs } = useDynamicData();

  const pendingStudents = students.filter((s) => !s.is_verified);
  const pendingCompanies = companies.filter((c) => c.status === "PENDING");
  const pendingJobs = jobs.filter((j) => j.status === "PENDING_APPROVAL");
  const activeJobs = jobs.filter((j) => j.status === "ACTIVE");

  const totalStudents = students.length;
  const placedStudents = students.filter((s) => s.placement_status === "PLACED").length;
  const placementRate = totalStudents > 0 ? `${((placedStudents / totalStudents) * 100).toFixed(1)}%` : "0.0%";
  const highestCtc = jobs.length > 0 ? `${Math.max(...jobs.map((j) => j.ctc_lpa), 0).toFixed(1)} LPA` : "0.0 LPA";
  const avgCtc = jobs.length > 0
    ? `${(jobs.reduce((acc, j) => acc + j.ctc_lpa, 0) / jobs.length).toFixed(1)} LPA`
    : "0.0 LPA";

  return (
    <div className="space-y-6 text-on-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-outline-variant/40">
        <div>
          <h1 className="font-headline-lg text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
            Training & Placement Office (TPO) Command Center
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
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
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-4 shadow-xs hover:border-primary/50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-md bg-amber-500/10 text-amber-500">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-data-mono-sm text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {pendingStudents.length} Action Needed
            </span>
          </div>
          <h3 className="text-sm font-semibold text-on-surface mt-3">Student Verifications</h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Registered students pending academic criteria & marksheet verification.
          </p>
          <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="text-[11px] text-outline font-data-mono">REQ-5 Governance</span>
            <Link
              to="/tpo/students"
              className="inline-flex items-center text-xs font-semibold text-primary hover:underline group"
            >
              Review queue <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Corporate Partner Approval Queue */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-4 shadow-xs hover:border-primary/50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-data-mono-sm text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              {pendingCompanies.length} Corporate
            </span>
          </div>
          <h3 className="text-sm font-semibold text-on-surface mt-3">Recruiter Registrations</h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Corporate accounts awaiting GST/tax verification and university approval.
          </p>
          <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="text-[11px] text-outline font-data-mono">REQ-2 Governance</span>
            <Link
              to="/tpo/approvals"
              className="inline-flex items-center text-xs font-semibold text-primary hover:underline group"
            >
              Verify partners <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Job Drive Approval Queue */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-4 shadow-xs hover:border-primary/50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-md bg-tertiary/10 text-tertiary">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="font-data-mono-sm text-xs font-semibold px-2 py-0.5 rounded bg-tertiary/10 text-tertiary border border-tertiary/20">
              {pendingJobs.length} Pending Drive
            </span>
          </div>
          <h3 className="text-sm font-semibold text-on-surface mt-3">Job Drive Approvals</h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Recruiter postings awaiting eligibility parameter confirmation.
          </p>
          <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="text-[11px] text-outline font-data-mono">REQ-6 Governance</span>
            <Link
              to="/tpo/approvals"
              className="inline-flex items-center text-xs font-semibold text-primary hover:underline group"
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
          value={placementRate}
          subtext={`${placedStudents} of ${totalStudents} students placed`}
          icon={<Award className="w-4 h-4 text-tertiary" />}
          trend={{ value: "+4.2% YoY", isPositive: true }}
        />
        <StatCard
          label="Average CTC Package"
          value={avgCtc}
          subtext="Calculated across active drives"
          icon={<TrendingUp className="w-4 h-4 text-primary" />}
          trend={{ value: "+0.8 LPA", isPositive: true }}
        />
        <StatCard
          label="Highest Offered CTC"
          value={highestCtc}
          subtext="Across active campus roles"
          icon={<Briefcase className="w-4 h-4 text-secondary" />}
        />
        <StatCard
          label="Active Drives Live"
          value={`${activeJobs.length} Drives`}
          subtext="Available for student registration"
          icon={<Users className="w-4 h-4 text-amber-500" />}
        />
      </div>

      {/* Recent Drives and Direct Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Campus Drives */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
            <div>
              <h2 className="text-base font-semibold text-on-surface">Current Placement Drives</h2>
              <p className="text-xs text-on-surface-variant">Live recruitment cycles in progress</p>
            </div>
            <Link to="/tpo/approvals" className="text-xs font-semibold text-primary hover:underline">
              Manage all drives →
            </Link>
          </div>

          <div className="divide-y divide-outline-variant/20">
            {jobs.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant font-data-mono text-xs italic">
                No campus recruitment drives found. Once companies register and post hiring drives, they will appear here.
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-surface-container-low/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-on-surface">{job.title}</span>
                      {job.status === "ACTIVE" ? (
                        <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Pending Approval
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant flex items-center gap-3">
                      <span className="font-medium text-on-surface">{job.company_name}</span>
                      <span>·</span>
                      <span className="font-data-mono font-medium text-primary">{job.ctc_lpa.toFixed(1)} LPA</span>
                      <span>·</span>
                      <span>Min CGPA {job.min_cgpa.toFixed(1)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-outline font-data-mono">
                      {job.applicant_count} applicants
                    </span>
                    <Link to={`/company/jobs/${job.id}`}>
                      <Button variant="ghost" size="sm">
                        Inspect
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Institutional Policy & Single Offer Notice */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-outline-variant/30">
            <h2 className="text-base font-semibold text-on-surface">Institutional Governance</h2>
            <p className="text-xs text-on-surface-variant">Enforced by Rules.md §4.1</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-md bg-surface-container-low border border-outline-variant/40 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold text-on-surface">
                <span>Single Offer Threshold</span>
                <span className="font-data-mono text-primary font-bold">8.0 LPA</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Students with offers under 8.0 LPA remain eligible for "Dream" drives offering &gt;8.0 LPA.
              </p>
            </div>

            <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Verification Invalidation</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                When a student updates their CGPA or backlog count, their profile is automatically flagged unverified until re-checked by TPO.
              </p>
            </div>

            <div className="p-3 rounded-md bg-primary/10 border border-primary/20 text-xs text-primary space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <Clock className="w-4 h-4 text-primary" />
                <span>Drive Deadline Enforcement</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Application deadlines are strictly locked to the second. No late submissions can bypass database rule constraints.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TpoDashboardPage;
