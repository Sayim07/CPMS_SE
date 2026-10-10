import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { JobDetailModal } from "./JobDetailModal";
import { evaluateEligibility } from "../../mock/eligibility";
import {
  MOCK_JOBS,
  MOCK_STUDENTS,
  MOCK_APPLICATIONS,
  type Job,
  type Student,
  type Application,
} from "../../mock/mockData";
import {
  Search,
  Building2,
  Clock,
  ArrowRight,
} from "lucide-react";

export const StudentJobsPage: React.FC = () => {
  const { user } = useAuth();
  const currentStudent: Student =
    MOCK_STUDENTS.find((s) => s.id === user.id) || MOCK_STUDENTS[0];

  const [jobs] = useState<Job[]>(MOCK_JOBS.filter((j) => j.status === "ACTIVE"));
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [minCTC, setMinCTC] = useState<number>(0);

  const handleApply = (jobId: string) => {
    const newApp: Application = {
      id: `app-${Date.now()}`,
      job_id: jobId,
      student_id: currentStudent.id,
      student: {
        id: currentStudent.id,
        full_name: currentStudent.full_name,
        roll_no: currentStudent.roll_no,
        department_code: currentStudent.department_code,
        cgpa: currentStudent.cgpa,
        active_backlogs: currentStudent.active_backlogs,
        email: currentStudent.email,
        phone: currentStudent.phone,
      },
      stage: "APPLIED",
      applied_at: new Date().toISOString(),
    };
    setApplications([newApp, ...applications]);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCTC = job.ctc_lpa >= minCTC;

    if (!matchesSearch || !matchesCTC) return false;

    if (eligibleOnly) {
      const { eligible } = evaluateEligibility(currentStudent, job, applications);
      return eligible;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campus Placement Drives</h1>
          <p className="text-xs text-slate-500 mt-1">
            Active corporate drives open for the 2026 graduating batch. Eligibility is computed automatically per your academic profile.
          </p>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Student CGPA:</span>
          <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
            {currentStudent.cgpa.toFixed(2)} ({currentStudent.department_code})
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search role or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={eligibleOnly}
              onChange={(e) => setEligibleOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Show Eligible Only</span>
          </label>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Min CTC:</span>
            <select
              value={minCTC}
              onChange={(e) => setMinCTC(Number(e.target.value))}
              className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={0}>All Packages</option>
              <option value={6}>≥ 6 LPA</option>
              <option value={8}>≥ 8 LPA</option>
              <option value={10}>≥ 10 LPA</option>
              <option value={12}>≥ 12 LPA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Card Grid (Design.md §2) */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          title="No drives match your filters"
          description="Try disabling the 'Eligible Only' filter or lowering the minimum CTC requirement to browse all campus drives."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setEligibleOnly(false);
                setMinCTC(0);
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => {
            const { eligible } = evaluateEligibility(currentStudent, job, applications);
            const hasApplied = applications.some(
              (app) => app.job_id === job.id && app.student_id === currentStudent.id
            );

            return (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="group bg-white rounded-lg border border-slate-200 p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-150 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.company_name}</span>
                      </p>
                    </div>

                    <div className="shrink-0">
                      {hasApplied ? (
                        <Badge variant="neutral" size="sm">Applied</Badge>
                      ) : eligible ? (
                        <Badge variant="eligible" size="sm">Eligible</Badge>
                      ) : (
                        <Badge variant="mismatch" size="sm">Mismatch</Badge>
                      )}
                    </div>
                  </div>

                  {/* CTC Highlight */}
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-slate-900 font-mono tracking-tight">
                      {job.ctc_lpa} LPA
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans">Full-Time</span>
                  </div>

                  {/* Description preview */}
                  <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Cutoff Criteria Pills */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 text-[11px] font-mono text-slate-600">
                    <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      Min CGPA: {job.min_cgpa.toFixed(1)}
                    </span>
                    <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      Depts: {job.department_codes.join(", ")}
                    </span>
                  </div>
                </div>

                {/* Footer of Card */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>Closes {new Date(job.application_deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  </span>

                  <span className="text-indigo-600 font-medium flex items-center gap-1 text-xs group-hover:translate-x-0.5 transition-transform">
                    <span>View & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        student={currentStudent}
        applications={applications}
        onApply={handleApply}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
};
