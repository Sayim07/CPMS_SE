import React, { useState } from "react";
import { StatCard } from "../../components/ui/StatCard";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { MOCK_STUDENTS } from "../../mock/mockData";
import {
  Download,
  Award,
  TrendingUp,
  Briefcase,
  Building2,
  CheckCircle2,
  Mail,
} from "lucide-react";

export const TpoReportsPage: React.FC = () => {
  const [exportAlert, setExportAlert] = useState<string | null>(null);

  const handleExport = (format: "CSV" | "PDF") => {
    setExportAlert(`Generated and downloaded "CPMS_Placement_Report_2026.${format.toLowerCase()}".`);
    setTimeout(() => setExportAlert(null), 4000);
  };

  const unplacedStudents = MOCK_STUDENTS.filter((s) => s.placement_status === "UNPLACED");

  // Department Placement Breakdown
  const deptBreakdown = [
    { code: "CSE", name: "Computer Science & Engineering", rate: 89.4, placed: 42, total: 47, avgCtc: 11.2 },
    { code: "IT", name: "Information Technology", rate: 82.3, placed: 28, total: 34, avgCtc: 9.8 },
    { code: "ECE", name: "Electronics & Communication", rate: 71.4, placed: 15, total: 21, avgCtc: 8.4 },
    { code: "MECH", name: "Mechanical Engineering", rate: 50.0, placed: 9, total: 18, avgCtc: 6.8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Institutional Placement Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official Placement Record · Batch 2022–2026 · Generated on {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleExport("CSV")}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => handleExport("PDF")}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Official PDF Summary
          </Button>
        </div>
      </div>

      {/* Export Toast */}
      {exportAlert && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-md flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{exportAlert}</span>
          </div>
          <button onClick={() => setExportAlert(null)} className="text-emerald-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* 4 Core KPI StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Overall Placement Rate"
          value="78.4%"
          subtext="94 offers out of 120 eligible candidates"
          icon={<Award className="w-4 h-4 text-emerald-600" />}
          trend={{ value: "+5.1% YoY", isPositive: true }}
        />
        <StatCard
          label="Average CTC Package"
          value="9.4 LPA"
          subtext="Median package: 8.2 LPA"
          icon={<TrendingUp className="w-4 h-4 text-indigo-600" />}
          trend={{ value: "+0.8 LPA", isPositive: true }}
        />
        <StatCard
          label="Highest CTC Package"
          value="24.0 LPA"
          subtext="Secured at Acme Technologies"
          icon={<Briefcase className="w-4 h-4 text-sky-600" />}
        />
        <StatCard
          label="Participating Employers"
          value="18 Companies"
          subtext="4 premier / dream tier recruiters"
          icon={<Building2 className="w-4 h-4 text-amber-600" />}
        />
      </div>

      {/* Department Comparison Chart & Rate Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Placement Comparison (Bar Chart) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Placement Distribution by Department</h2>
              <p className="text-xs text-slate-500">Placement conversion ratios across engineering disciplines</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Class of 2026</span>
          </div>

          <div className="space-y-4 pt-1">
            {deptBreakdown.map((dept) => (
              <div key={dept.code} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{dept.code}</span>
                    <span className="text-slate-500 hidden sm:inline">({dept.name})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-500">
                      {dept.placed}/{dept.total} placed
                    </span>
                    <span className="font-semibold text-slate-800">Avg {dept.avgCtc} LPA</span>
                    <span className="font-bold text-indigo-600 w-12 text-right">{dept.rate}%</span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${dept.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Placement Rate Gauge Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Season Target Gauge</h2>
            <p className="text-xs text-slate-500">University placement target: 85%</p>
          </div>

          <div className="py-6 flex flex-col items-center justify-center text-center">
            {/* SVG Circular Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-100"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - 0.784)}
                  className="text-indigo-600 stroke-round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono text-slate-900">78.4%</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Placed</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-4 max-w-[200px]">
              26 unplaced students remain in candidate pool with 4 active recruitment drives.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Next Drive: Google Cloud</span>
            <span className="font-mono text-indigo-600 font-medium">Oct 24</span>
          </div>
        </div>
      </div>

      {/* Unplaced Students Attention Queue */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Candidate Pool Requiring Attention</h3>
            <p className="text-xs text-slate-500">
              Students without an active offer eligible for upcoming drives
            </p>
          </div>
          <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {unplacedStudents.length} Unplaced Candidates
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {unplacedStudents.map((student) => (
            <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900">{student.full_name}</span>
                  <span className="font-mono text-xs text-slate-500">({student.roll_no})</span>
                  <span className="px-2 py-0.5 text-[10px] rounded bg-slate-100 font-mono text-slate-700">
                    {student.department_code}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span>CGPA: <strong className="font-mono text-slate-800">{student.cgpa.toFixed(2)}</strong></span>
                  <span>·</span>
                  <span>Backlogs: <strong className="font-mono text-slate-800">{student.active_backlogs}</strong></span>
                  <span>·</span>
                  <span>
                    Verification:{" "}
                    {student.is_verified ? (
                      <Badge variant="eligible" size="sm">Verified</Badge>
                    ) : (
                      <Badge variant="warning" size="sm">Pending</Badge>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`mailto:${student.email}?subject=CPMS Placement Counseling`}
                  className="inline-flex items-center"
                >
                  <Button variant="secondary" size="sm">
                    <Mail className="w-3.5 h-3.5 mr-1" />
                    Counseling Alert
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
