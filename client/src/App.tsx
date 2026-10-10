import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppShell } from "./components/layout/AppShell";
import { StatCard } from "./components/ui/StatCard";
import { Badge } from "./components/ui/Badge";
import { StageChip } from "./components/ui/StageChip";
import { DataTable, type Column } from "./components/ui/DataTable";
import { Button } from "./components/ui/Button";
import {
  MOCK_STUDENTS,
  MOCK_JOBS,
  type Student,
} from "./mock/mockData";
import {
  Briefcase,
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Building2,
} from "lucide-react";

/**
 * Overview / Showcase Page bringing all Wave 1 components together.
 */
const OverviewDashboard: React.FC = () => {
  const { user } = useAuth();
  const [studentVerified, setStudentVerified] = useState(user.isVerified ?? true);

  // Student Columns for DataTable demo
  const studentColumns: Column<Student>[] = [
    {
      key: "roll_no",
      header: "Roll No",
      render: (s) => <span className="font-mono text-xs font-semibold text-slate-800">{s.roll_no}</span>,
    },
    {
      key: "full_name",
      header: "Student Name",
      render: (s) => (
        <div>
          <p className="font-medium text-slate-900">{s.full_name}</p>
          <p className="text-xs text-slate-400 font-mono">{s.email}</p>
        </div>
      ),
    },
    {
      key: "department_code",
      header: "Dept",
      render: (s) => <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs">{s.department_code}</span>,
    },
    {
      key: "cgpa",
      header: "CGPA",
      render: (s) => <span className="font-semibold text-slate-800">{s.cgpa.toFixed(2)}</span>,
    },
    {
      key: "active_backlogs",
      header: "Backlogs",
      render: (s) => (
        <span className={s.active_backlogs > 0 ? "text-red-600 font-medium" : "text-slate-500"}>
          {s.active_backlogs}
        </span>
      ),
    },
    {
      key: "is_verified",
      header: "TPO Verification",
      render: (s) =>
        s.is_verified ? (
          <Badge variant="eligible" size="sm">Verified</Badge>
        ) : (
          <Badge variant="warning" size="sm">Pending</Badge>
        ),
    },
    {
      key: "placement_status",
      header: "Status",
      render: (s) => (
        <StageChip stage={s.placement_status === "PLACED" ? "SELECTED" : "APPLIED"} size="sm" />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Verification Alert Banner (Design.md §5.3) */}
      {!studentVerified && user.role === "STUDENT" && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md flex items-start justify-between shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">Awaiting TPO Verification</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Your academic profile is currently unverified. You can browse active placement drives, but application submissions are disabled until the Placement Cell reviews your records.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setStudentVerified(true)}
            className="text-xs bg-white text-amber-900 border-amber-200 hover:bg-amber-100 shrink-0 ml-4"
          >
            Simulate Verify
          </Button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {user.role === "STUDENT" && "Student Placement Portal"}
            {user.role === "COMPANY" && "Recruiter Drive Console"}
            {user.role === "TPO" && "Training & Placement Officer Command Center"}
            {user.role === "ADMIN" && "System Administration & Settings"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <span className="font-medium text-slate-700">{user.fullName}</span> ({user.email}) · Campus Placement Season 2026
          </p>
        </div>

        {user.role === "STUDENT" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStudentVerified(!studentVerified)}
            className="text-xs self-start sm:self-auto"
          >
            Toggle Verification Banner ({studentVerified ? "Verified" : "Unverified"})
          </Button>
        )}
      </div>

      {/* KPI StatCards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Placement Rate"
          value="78.4%"
          subtext="120 eligible students in 2026 batch"
          icon={<Award className="w-4 h-4 text-emerald-600" />}
          trend={{ value: "+4.2% YoY", isPositive: true }}
        />
        <StatCard
          label="Active Drives"
          value={MOCK_JOBS.filter((j) => j.status === "ACTIVE").length}
          subtext="2 drives closing this week"
          icon={<Briefcase className="w-4 h-4 text-indigo-600" />}
        />
        <StatCard
          label="Average CTC"
          value="9.4 LPA"
          subtext="Highest offer: 24.0 LPA"
          icon={<TrendingUp className="w-4 h-4 text-sky-600" />}
        />
        <StatCard
          label="Registered Candidates"
          value={MOCK_STUDENTS.length}
          subtext="1 student awaiting TPO verification"
          icon={<Users className="w-4 h-4 text-amber-600" />}
        />
      </div>

      {/* Interactive Feature Demo: Anti-Slop Badges & Chips Showcase */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Design Tokens & Semantic Verdicts (Design.md §3)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Crafted with high-density utilitarian minimalism. Every badge pairs a crisp Lucide icon with descriptive text.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Badge variant="eligible">Eligible for Drive</Badge>
          <Badge variant="mismatch">Criteria Mismatch (CGPA &lt; 7.5)</Badge>
          <Badge variant="warning">Verification Pending</Badge>
          <Badge variant="info">Interview Scheduled</Badge>
          <Badge variant="neutral">Single Offer Locked</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-400 mr-2">Funnel Stage Chips:</span>
          <StageChip stage="APPLIED" />
          <StageChip stage="SHORTLISTED" />
          <StageChip stage="IN_INTERVIEW" />
          <StageChip stage="SELECTED" />
          <StageChip stage="REJECTED" />
        </div>
      </div>

      {/* High-Density Data Table Demonstration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Student Placement Cohort (2026 Batch)</h2>
            <p className="text-xs text-slate-500">
              Interactive data grid with sticky headers, monospace identifiers, and subtle hover states.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
            {MOCK_STUDENTS.length} Records Loaded
          </span>
        </div>

        <DataTable
          columns={studentColumns}
          data={MOCK_STUDENTS}
          keyExtractor={(s) => s.id}
          page={1}
          pageSize={10}
          total={MOCK_STUDENTS.length}
          onPageChange={() => {}}
        />
      </div>

      {/* Active Drives Mini-Cards */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">Upcoming Campus Drives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_JOBS.slice(0, 2).map((job) => (
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

                <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono text-slate-600">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">CTC: {job.ctc_lpa} LPA</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Min CGPA: {job.min_cgpa}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Depts: {job.department_codes.join(", ")}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Deadline: Nov 15, 2026</span>
                <Button variant="primary" size="sm">
                  <span>View Drive</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<OverviewDashboard />} />
            <Route path="/student" element={<OverviewDashboard />} />
            <Route path="/student/*" element={<OverviewDashboard />} />
            <Route path="/company" element={<OverviewDashboard />} />
            <Route path="/company/*" element={<OverviewDashboard />} />
            <Route path="/tpo" element={<OverviewDashboard />} />
            <Route path="/tpo/*" element={<OverviewDashboard />} />
            <Route path="/admin" element={<OverviewDashboard />} />
            <Route path="/admin/*" element={<OverviewDashboard />} />
            <Route path="/notifications" element={<OverviewDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
