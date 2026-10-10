import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { StatCard } from "../../components/ui/StatCard";
import { Badge } from "../../components/ui/Badge";
import { StageChip } from "../../components/ui/StageChip";
import { Button } from "../../components/ui/Button";
import {
  MOCK_JOBS,
  MOCK_APPLICATIONS,
  MOCK_STUDENTS,
  type Student,
} from "../../mock/mockData";
import {
  Briefcase,
  FileText,
  Award,
  Video,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
} from "lucide-react";

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const currentStudent: Student =
    MOCK_STUDENTS.find((s) => s.id === user.id) || MOCK_STUDENTS[0];

  const activeDrives = MOCK_JOBS.filter((j) => j.status === "ACTIVE");
  const myApplications = MOCK_APPLICATIONS;

  return (
    <div className="space-y-6">
      {/* Top Verification Alert Banner (Design.md §5.3) */}
      {!currentStudent.is_verified && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md flex items-start justify-between shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">Awaiting TPO Verification</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Your academic credentials have not yet been approved by the Placement Officer. You can review corporate job drives, but application submissions will be locked until verification is granted.
              </p>
            </div>
          </div>
          <Link to="/student/profile">
            <Button variant="secondary" size="sm" className="text-xs bg-white text-amber-900 border-amber-200">
              Check Profile
            </Button>
          </Link>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {currentStudent.full_name}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Roll No: <span className="font-mono font-medium text-slate-700">{currentStudent.roll_no}</span> · Department: <span className="font-semibold text-slate-700">{currentStudent.department_code}</span> · Graduating Cohort: {currentStudent.batch_year}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentStudent.is_verified ? (
            <Badge variant="eligible">Profile Verified</Badge>
          ) : (
            <Badge variant="warning">Verification Pending</Badge>
          )}
          <StageChip stage={currentStudent.placement_status === "PLACED" ? "SELECTED" : "APPLIED"} />
        </div>
      </div>

      {/* KPI StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="My Applications"
          value={myApplications.length}
          subtext="1 in interview round"
          icon={<FileText className="w-4 h-4 text-indigo-600" />}
        />
        <StatCard
          label="Active Campus Drives"
          value={activeDrives.length}
          subtext="2 corporate drives open"
          icon={<Briefcase className="w-4 h-4 text-emerald-600" />}
        />
        <StatCard
          label="Current CGPA"
          value={currentStudent.cgpa.toFixed(2)}
          subtext={`${currentStudent.active_backlogs} active backlogs`}
          icon={<Award className="w-4 h-4 text-amber-600" />}
        />
        <StatCard
          label="Placement Status"
          value={currentStudent.placement_status}
          subtext={currentStudent.single_offer_locked ? "Single offer policy locked" : "Eligible for standard drives"}
          icon={<CheckCircle2 className="w-4 h-4 text-sky-600" />}
        />
      </div>

      {/* Upcoming Interview Alerts Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-slate-900">Upcoming Interview Rounds</h2>
          </div>
          <Link to="/student/applications" className="text-xs font-medium text-indigo-600 hover:underline">
            View All Applications &rarr;
          </Link>
        </div>

        <div className="p-4 rounded-lg bg-sky-50/70 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
              Technical Round 1
            </span>
            <h4 className="text-sm font-semibold text-slate-900 mt-1">
              Acme Technologies — Software Development Engineer
            </h4>
            <p className="text-xs text-sky-700 mt-0.5 font-mono">
              Scheduled: Oct 15, 2026 at 10:00 AM IST (Online)
            </p>
          </div>

          <a
            href="https://meet.example.com/acme-sde-round1"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-md bg-white border border-sky-200 text-xs font-semibold text-sky-800 hover:bg-sky-100 shadow-sm transition-colors shrink-0"
          >
            Join Interview Room
          </a>
        </div>
      </div>

      {/* Quick Access Grid: Recent Drives Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Featured Campus Drives</h2>
          <Link to="/student/jobs" className="text-xs font-medium text-indigo-600 hover:underline flex items-center gap-1">
            <span>Browse Full Job Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeDrives.slice(0, 2).map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{job.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.company_name}</span>
                    </p>
                  </div>
                  <Badge variant="eligible" size="sm">
                    Eligible
                  </Badge>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-slate-900 font-mono">{job.ctc_lpa} LPA</span>
                  <span className="text-[11px] text-slate-400">Full-Time</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-mono text-slate-600">
                  <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">Min CGPA: {job.min_cgpa}</span>
                  <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">Backlogs: ≤ {job.max_backlogs}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Closes Nov 15</span>
                <Link to="/student/jobs">
                  <Button variant="primary" size="sm">
                    Review & Apply
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
