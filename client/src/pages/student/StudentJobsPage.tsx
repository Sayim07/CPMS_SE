import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDynamicData } from "../../hooks/useDynamicData";
import { JobDetailModal } from "./JobDetailModal";
import { evaluateEligibility } from "../../mock/eligibility";
import {
  type Job,
} from "../../mock/mockData";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  Upload,
  BookOpen,
  Briefcase,
  ExternalLink,
  Timer,
  Check,
} from "lucide-react";

export const StudentJobsPage: React.FC = () => {
  const { currentStudent, jobs: allJobs, applications, applyToJob } = useDynamicData();

  const jobs = allJobs.filter((j) => j.status === "ACTIVE");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "ELIGIBLE" | "APPLIED" | "RESTRICTED">("ALL");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");

  const handleApply = (jobId: string) => {
    const res = applyToJob(jobId);
    if (!res.success) {
      alert(res.message);
    }
  };

  if (!currentStudent) {
    return (
      <div className="space-y-6 max-w-4xl text-black dark:text-white">
        <div className="p-8 rounded-neo bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] text-center space-y-4">
          <div className="w-16 h-16 rounded-neo bg-[#FFE600] border-2 border-black mx-auto flex items-center justify-center font-black text-2xl shadow-[3px_3px_0px_0px_#000]">
            !
          </div>
          <h2 className="text-xl font-black uppercase">No Student Profile Linked</h2>
          <p className="text-sm font-bold text-black/70 dark:text-white/70 max-w-md mx-auto">
            You are logged in without a registered candidate profile. Register your student record to check CTC eligibility and apply for placement drives.
          </p>
          <div className="pt-2">
            <Link
              to="/register/student"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <span>Register Student Profile →</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getJobEligibility = (job: Job) => {
    return evaluateEligibility(currentStudent, job, applications);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.company_name || (job as any).company?.company_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase());

    const elig = getJobEligibility(job);
    const hasApplied = currentStudent
      ? applications.some((a) => a.job_id === job.id && a.student_id === currentStudent.id)
      : false;

    let matchesTab = true;
    if (filterTab === "ELIGIBLE") matchesTab = elig.eligible && !hasApplied;
    else if (filterTab === "APPLIED") matchesTab = hasApplied;
    else if (filterTab === "RESTRICTED") matchesTab = !elig.eligible;

    let matchesTier = true;
    if (selectedTier === "SUPER_DREAM") matchesTier = job.ctc_lpa >= 18;
    else if (selectedTier === "DREAM") matchesTier = job.ctc_lpa >= 8 && job.ctc_lpa < 18;
    else if (selectedTier === "STANDARD") matchesTier = job.ctc_lpa < 8;

    return matchesSearch && matchesTab && matchesTier;
  });

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* 1. Student Dossier Header Card (Stitch Spec) */}
      <div className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Student Info Block */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary font-bold text-base shrink-0">
              <span className="font-data-mono">{currentStudent.full_name.charAt(0)}R</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-headline-sm text-lg font-semibold text-on-surface tracking-tight">
                  {currentStudent.full_name}
                </h1>
                <span className="font-data-mono text-xs font-medium text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant/40">
                  {currentStudent.roll_no}
                </span>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-data-mono-sm text-[11px] font-medium border border-tertiary/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-tertiary" />
                  <span>TPO Verified</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant text-xs mt-0.5 flex-wrap">
                <span>B.Tech {currentStudent.department_code} (2021–2025)</span>
                <span className="text-outline-variant/60">•</span>
                <span className="font-data-mono text-xs text-on-surface font-medium">
                  Rank: #14 / 184
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 lg:pb-0">
            <div className="flex flex-col px-3 py-1.5 rounded bg-surface-container-low border border-outline-variant/30 min-w-[100px]">
              <span className="font-label-sm text-[11px] text-on-surface-variant">Current CGPA</span>
              <div className="flex items-baseline gap-1">
                <span className="font-metric-num text-xl font-bold text-primary">
                  {currentStudent.cgpa.toFixed(2)}
                </span>
                <span className="font-data-mono-sm text-xs text-outline">/10.0</span>
              </div>
            </div>
            <div className="flex flex-col px-3 py-1.5 rounded bg-surface-container-low border border-outline-variant/30 min-w-[110px]">
              <span className="font-label-sm text-[11px] text-on-surface-variant">Active Backlogs</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-metric-num text-xl font-bold text-tertiary">
                  {currentStudent.active_backlogs}
                </span>
                <span className="font-data-mono-sm text-xs text-tertiary font-medium">Clean Record</span>
              </div>
            </div>
            <div className="flex flex-col px-3 py-1.5 rounded bg-surface-container-low border border-outline-variant/30 min-w-[120px]">
              <span className="font-label-sm text-[11px] text-on-surface-variant">Semesters</span>
              <div className="flex items-baseline gap-1">
                <span className="font-metric-num text-xl font-bold text-on-surface">6 of 8</span>
                <span className="font-data-mono-sm text-xs text-outline">Cleared</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Meta Strip / Actions */}
        <div className="mt-3.5 pt-3 border-t border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-on-surface-variant">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <FileText className="w-3.5 h-3.5 text-outline" />
            <span className="font-medium text-on-surface">Primary Resume:</span>
            <span className="font-data-mono text-[11px] bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant">
              Asha_Roy_Resume_v4.2.pdf
            </span>
            <span className="text-outline">•</span>
            <span className="text-outline">Verified 3 days ago</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-surface-container-low border border-outline-variant/50 hover:bg-surface-container text-on-surface text-xs font-medium transition-colors"
            >
              <Upload className="w-3 h-3" />
              <span>Update Resume</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-surface-container-low border border-outline-variant/50 hover:bg-surface-container text-on-surface text-xs font-medium transition-colors"
            >
              <BookOpen className="w-3 h-3" />
              <span>Transcript</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Institutional Policy Alert Banner */}
      <div className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-1 rounded bg-surface-container-lowest border border-outline-variant/40 shrink-0 text-primary mt-0.5">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="flex flex-col space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-on-surface">
                Single Offer Policy Active (Rule 4.2.1 • Dream Threshold: ₹8.00 LPA)
              </span>
              <span className="font-data-mono-sm text-[10px] px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-medium">
                0 Offers Held
              </span>
            </div>
            <p className="text-xs text-on-surface-variant max-w-4xl">
              Students securing an offer <span className="font-data-mono-sm font-semibold text-on-surface">≥ ₹8.0 LPA</span> are restricted to <strong className="text-on-surface font-semibold">Super-Dream (≥ ₹18.0 LPA)</strong> drives only. You are currently unrestricted across all standard, dream, and super-dream tiers.
            </p>
          </div>
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline shrink-0"
        >
          <span>Placement Manual</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* 3. Filter Toolbar */}
      <div className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, job ID, role or skill..."
            className="w-full pl-8 pr-16 py-1 rounded bg-surface-container-low border border-outline-variant/50 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary h-8"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 font-data-mono-sm text-[10px] text-outline bg-surface-container px-1 py-0.5 rounded border border-outline-variant/40">
            Ctrl+K
          </kbd>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-surface-container-low p-0.5 rounded border border-outline-variant/40 text-xs">
            <button
              type="button"
              onClick={() => setFilterTab("ALL")}
              className={`px-2 py-1 rounded transition-colors ${
                filterTab === "ALL"
                  ? "bg-surface-container-lowest text-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              All ({jobs.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("ELIGIBLE")}
              className={`px-2 py-1 rounded transition-colors ${
                filterTab === "ELIGIBLE"
                  ? "bg-surface-container-lowest text-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Eligible ({jobs.filter((j) => getJobEligibility(j).eligible).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("APPLIED")}
              className={`px-2 py-1 rounded transition-colors ${
                filterTab === "APPLIED"
                  ? "bg-surface-container-lowest text-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Applied ({applications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("RESTRICTED")}
              className={`px-2 py-1 rounded transition-colors ${
                filterTab === "RESTRICTED"
                  ? "bg-surface-container-lowest text-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Restricted ({jobs.filter((j) => !getJobEligibility(j).eligible).length})
            </button>
          </div>

          <div className="h-4 w-[1px] bg-outline-variant/50 hidden md:block" />

          {/* Tier Dropdown */}
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container-low border border-outline-variant/40 shrink-0 text-xs">
            <span className="text-on-surface-variant">Tier:</span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-transparent font-medium text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Tiers</option>
              <option value="SUPER_DREAM">Super-Dream (≥18 LPA)</option>
              <option value="DREAM">Dream (8–18 LPA)</option>
              <option value="STANDARD">Standard (&lt;8 LPA)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Placement Drives Cards List (Stitch Layout) */}
      <div className="flex flex-col space-y-3">
        {filteredJobs.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-12 text-center text-on-surface-variant">
            <p className="text-sm font-semibold text-on-surface">No placement drives found</p>
            <p className="text-xs mt-1">Try relaxing your search or tier filters.</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const eligibility = getJobEligibility(job);
            const hasApplied = applications.some(
              (a) => a.job_id === job.id && a.student_id === currentStudent.id
            );

            const isSuperDream = job.ctc_lpa >= 18;
            const isDream = job.ctc_lpa >= 8 && job.ctc_lpa < 18;
            const companyName = job.company_name || (job as any).company?.company_name || "Company";
            const deptCodes = job.department_codes || (job as any).departments || ["CSE", "IT"];

            return (
              <div
                key={job.id}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-4 shadow-sm hover:border-outline transition-colors"
              >
                {/* Card Header: Company, ID, Tier, Package */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-outline-variant/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-surface-container-low border border-outline-variant/40 flex items-center justify-center font-data-mono font-bold text-on-surface text-sm shrink-0">
                      {companyName.substring(0, 3).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-headline-sm text-base font-semibold text-on-surface">
                          {companyName}
                        </span>
                        <span className="font-data-mono-sm text-[11px] text-outline bg-surface-container px-1.5 py-0.5 rounded">
                          {job.id}
                        </span>
                        <span
                          className={`font-data-mono-sm text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            isSuperDream
                              ? "bg-primary-fixed text-on-primary-fixed"
                              : isDream
                              ? "bg-secondary-fixed text-on-secondary-fixed"
                              : "bg-surface-container text-on-surface-variant"
                          }`}
                        >
                          {isSuperDream ? "Super-Dream Tier" : isDream ? "Dream Tier" : "Standard Tier"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-on-surface-variant">
                        <span className="font-medium text-on-surface">{job.title}</span>
                        <span className="text-outline-variant">•</span>
                        <span>{(job as any).website || "Campus Drive"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end">
                    <div className="flex items-baseline gap-1">
                      <span className="font-metric-num text-xl font-bold text-primary">
                        ₹{job.ctc_lpa.toFixed(2)}
                      </span>
                      <span className="font-data-mono text-xs font-semibold text-on-surface">
                        LPA CTC
                      </span>
                    </div>
                    <span className="font-data-mono-sm text-[11px] text-outline">
                      Fixed Base + Perks
                    </span>
                  </div>
                </div>

                {/* 4-Grid Parameters & Realtime Criteria Audit */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 py-3 text-xs">
                  {/* CGPA */}
                  <div className="p-2 rounded bg-surface-container-low/70 border border-outline-variant/30">
                    <span className="font-label-sm text-[11px] text-on-surface-variant block">
                      CGPA Cutoff
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {currentStudent.cgpa >= job.min_cgpa ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-tertiary" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-error" />
                      )}
                      <span className="font-data-mono-sm text-xs font-medium text-on-surface">
                        Min: {job.min_cgpa.toFixed(2)}{" "}
                        <span
                          className={
                            currentStudent.cgpa >= job.min_cgpa ? "text-tertiary font-bold" : "text-error font-bold"
                          }
                        >
                          (You: {currentStudent.cgpa.toFixed(2)})
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Backlogs */}
                  <div className="p-2 rounded bg-surface-container-low/70 border border-outline-variant/30">
                    <span className="font-label-sm text-[11px] text-on-surface-variant block">
                      Backlog Limit
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {currentStudent.active_backlogs <= job.max_backlogs ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-tertiary" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-error" />
                      )}
                      <span className="font-data-mono-sm text-xs font-medium text-on-surface">
                        Max: {job.max_backlogs}{" "}
                        <span className="text-tertiary font-bold">
                          (You: {currentStudent.active_backlogs})
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Branches */}
                  <div className="p-2 rounded bg-surface-container-low/70 border border-outline-variant/30">
                    <span className="font-label-sm text-[11px] text-on-surface-variant block">
                      Eligible Branches
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {deptCodes.includes(currentStudent.department_code) ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-tertiary" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-error" />
                      )}
                      <span className="font-data-mono-sm text-xs font-medium text-on-surface">
                        {deptCodes.join(", ")}
                      </span>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="p-2 rounded bg-surface-container-low/70 border border-outline-variant/30">
                    <span className="font-label-sm text-[11px] text-on-surface-variant block">
                      Registration Closes
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Timer className="w-3.5 h-3.5 text-primary" />
                      <span className="font-data-mono-sm text-xs font-medium text-on-surface">
                        {new Date(job.application_deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Realtime Verdict Badge & Actions */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-outline-variant/20">
                  <div className="flex items-center gap-2 flex-wrap">
                    {hasApplied ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-data-mono-sm text-xs font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Application Submitted</span>
                      </span>
                    ) : eligibility.eligible ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-data-mono-sm text-xs font-semibold border border-tertiary/20">
                        <CheckCircle2 className="w-3.5 h-3.5 text-tertiary" />
                        <span>All Criteria Passed</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-data-mono-sm text-xs font-semibold border border-red-200 dark:border-red-900/50">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Criteria Mismatch</span>
                        </span>
                        {eligibility.reasons.map((r, i) => (
                          <span
                            key={i}
                            className="font-data-mono-sm text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedJob(job)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-low border border-outline-variant/50 text-xs font-medium text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span>View JD</span>
                    </button>

                    {!hasApplied && (
                      <button
                        type="button"
                        onClick={() => handleApply(job.id)}
                        disabled={!eligibility.eligible}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold transition-colors ${
                          eligibility.eligible
                            ? "bg-primary text-on-primary hover:bg-primary-container shadow-xs cursor-pointer"
                            : "bg-surface-container text-outline cursor-not-allowed opacity-60"
                        }`}
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          student={currentStudent}
          applications={applications}
          onClose={() => setSelectedJob(null)}
          onApply={handleApply}
        />
      )}
    </div>
  );
};
