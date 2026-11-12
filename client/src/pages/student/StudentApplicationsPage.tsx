import React from "react";
import { Link } from "react-router-dom";
import { useDynamicData } from "../../hooks/useDynamicData";
import { StageChip } from "../../components/ui/StageChip";
import {
  Building2,
  Video,
  Clock,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

export const StudentApplicationsPage: React.FC = () => {
  const { currentStudent, applications, jobs } = useDynamicData();

  const myApplications = currentStudent
    ? applications.filter((a) => a.student_id === currentStudent.id)
    : [];

  return (
    <div className="space-y-6 text-black dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b-2 border-black dark:border-white">
        <div>
          <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">
            My Application Funnel
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-1">
            Track real-time recruitment progress, stage verdicts, and scheduled interview rounds across active drives.
          </p>
        </div>

        <div className="text-xs text-black dark:text-white font-mono font-black bg-[#FFE600] border-2 border-black px-3 py-1.5 rounded-neo shadow-[2px_2px_0px_0px_#000]">
          {myApplications.length} SUBMISSIONS
        </div>
      </div>

      {myApplications.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-neo p-8 text-center shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
          <h3 className="font-black text-lg text-black dark:text-white">No applications submitted yet</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-1">
            Browse the campus placement board to review your eligibility and apply to companies.
          </p>
          <div className="mt-4">
            <Link
              to="/student/jobs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black text-xs shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <span>Browse Drives</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {myApplications.map((app) => {
            const job = jobs.find((j) => j.id === app.job_id);
            const round =
              app.stage === "IN_INTERVIEW"
                ? {
                    name: `Interview Round — ${job?.title || "Campus Placement"}`,
                    time: `${new Date(new Date(app.applied_at).getTime() + 86400000 * 2).toLocaleDateString()} at 10:00 AM IST`,
                    link: `https://meet.google.com/cpm-${app.id.slice(-6)}`,
                  }
                : null;

            return (
              <div
                key={app.id}
                className="bg-white dark:bg-zinc-900 rounded-neo border-2 border-black dark:border-white p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] space-y-4 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#fff] transition-all"
              >
                {/* Top Summary Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black/10 dark:border-white/10">
                  <div>
                    <h3 className="text-base font-black text-black dark:text-white">
                      {job?.title || "Campus Placement Drive"}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono flex items-center gap-2 mt-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="font-bold text-black dark:text-white">{job?.company_name || "Company"}</span>
                      <span>·</span>
                      <span className="font-black bg-[#FFE600] text-black px-1.5 py-0.5 rounded border border-black text-[11px]">
                        ₹{job?.ctc_lpa || 10} LPA
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Applied {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                    <StageChip stage={app.stage} size="md" />
                  </div>
                </div>

                {/* Funnel Progress Steps */}
                <div className="py-1">
                  <div className="flex items-center justify-between max-w-lg text-xs font-mono font-bold text-zinc-500">
                    <div className="flex items-center gap-1.5 text-black dark:text-white">
                      <div className="w-6 h-6 rounded border-2 border-black bg-[#FFE600] text-black flex items-center justify-center text-xs font-black shadow-[1px_1px_0px_0px_#000]">
                        1
                      </div>
                      <span>Applied</span>
                    </div>

                    <div className="h-0.5 w-12 bg-black dark:bg-white" />

                    <div
                      className={`flex items-center gap-1.5 ${
                        app.stage !== "APPLIED" ? "text-black dark:text-white" : "opacity-40"
                      }`}
                    >
                      <div className="w-6 h-6 rounded border-2 border-black bg-[#7DD3FC] text-black flex items-center justify-center text-xs font-black shadow-[1px_1px_0px_0px_#000]">
                        2
                      </div>
                      <span>Shortlisted</span>
                    </div>

                    <div className="h-0.5 w-12 bg-black dark:bg-white" />

                    <div
                      className={`flex items-center gap-1.5 ${
                        app.stage === "IN_INTERVIEW" || app.stage === "SELECTED"
                          ? "text-black dark:text-white"
                          : "opacity-40"
                      }`}
                    >
                      <div className="w-6 h-6 rounded border-2 border-black bg-[#A388EE] text-black flex items-center justify-center text-xs font-black shadow-[1px_1px_0px_0px_#000]">
                        3
                      </div>
                      <span>Interview</span>
                    </div>

                    <div className="h-0.5 w-12 bg-black dark:bg-white" />

                    <div
                      className={`flex items-center gap-1.5 ${
                        app.stage === "SELECTED" || app.stage === "REJECTED"
                          ? "text-black dark:text-white"
                          : "opacity-40"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded border-2 border-black flex items-center justify-center text-xs font-black shadow-[1px_1px_0px_0px_#000] ${
                          app.stage === "SELECTED"
                            ? "bg-[#86EFAC] text-black"
                            : app.stage === "REJECTED"
                            ? "bg-[#FF70A6] text-black"
                            : "bg-zinc-200 text-black"
                        }`}
                      >
                        4
                      </div>
                      <span>{app.stage === "SELECTED" ? "Offer ★" : app.stage === "REJECTED" ? "Rejected" : "Verdict"}</span>
                    </div>
                  </div>
                </div>

                {/* Scheduled Interview Round Alert */}
                {round && (
                  <div className="p-3.5 rounded-neo bg-[#7DD3FC] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
                    <div className="flex items-start gap-2.5">
                      <Video className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
                      <div>
                        <h4 className="text-xs font-black">{round.name}</h4>
                        <p className="text-[11px] font-mono font-medium mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{round.time}</span>
                        </p>
                      </div>
                    </div>

                    <a
                      href={round.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-neo bg-white border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all shrink-0 cursor-pointer"
                    >
                      <span>Join Meeting</span>
                      <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentApplicationsPage;
