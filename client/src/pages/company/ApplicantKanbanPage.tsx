import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useDynamicData } from "../../hooks/useDynamicData";
import { Modal } from "../../components/ui/Modal";
import {
  type Application,
} from "../../mock/mockData";
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Lock,
  Calendar,
  Building,
} from "lucide-react";

export const ApplicantKanbanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { jobs, applications, moveApplicationStage } = useDynamicData();

  const currentJob =
    (id && id !== "active" ? jobs.find((j) => j.id === id) : null) ||
    (jobs.length > 0 ? jobs[0] : null);

  // Applications for this drive
  const jobApplications = currentJob
    ? applications.filter((a) => a.job_id === currentJob.id)
    : [];

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [roundName, setRoundName] = useState("Technical Round 2 (System Architecture)");
  const [scheduledTime, setScheduledTime] = useState("2026-10-22T10:00");
  const [meetingLink, setMeetingLink] = useState("https://meet.example.com/acme-round2");
  const [roundCreatedAlert, setRoundCreatedAlert] = useState(false);

  // 5 Kanban Columns (Stitch Spec & Rules.md §4.4)
  const STAGES: Array<{
    key: "APPLIED" | "SHORTLISTED" | "IN_INTERVIEW" | "SELECTED" | "REJECTED";
    label: string;
    bg: string;
  }> = [
    { key: "APPLIED", label: "Applied (Masked)", bg: "bg-[#FFE600]" },
    { key: "SHORTLISTED", label: "Shortlisted", bg: "bg-[#7DD3FC]" },
    { key: "IN_INTERVIEW", label: "Interviewing", bg: "bg-[#A388EE]" },
    { key: "SELECTED", label: "Selected", bg: "bg-[#86EFAC]" },
    { key: "REJECTED", label: "Rejected", bg: "bg-[#FF70A6]" },
  ];

  const moveStage = (appId: string, newStage: Application["stage"]) => {
    moveApplicationStage(appId, newStage, user?.email);
  };

  const handleScheduleRound = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleModalOpen(false);
    setRoundCreatedAlert(true);
    setTimeout(() => setRoundCreatedAlert(false), 5000);
  };

  if (!currentJob) {
    return (
      <div className="flex flex-col w-full space-y-5 text-black dark:text-white max-w-4xl">
        <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-8 sm:p-12 rounded-neo shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-neo bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-black">
            <Building className="w-7 h-7" />
          </div>
          <h2 className="font-black text-xl sm:text-2xl uppercase tracking-tight">
            No Active Recruitment Drives Found
          </h2>
          <p className="text-xs sm:text-sm font-medium text-black/70 dark:text-white/70 max-w-md mx-auto">
            You do not currently have any active recruitment drives. Create and submit a drive to start receiving candidate applications on your Kanban board.
          </p>
          <div className="pt-2">
            <Link
              to="/company/jobs/new"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <span>+ Post New Recruitment Drive →</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full space-y-5 text-black dark:text-white">
      {/* Top Header Card - Neobrutalism Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-4 sm:p-5 rounded-neo shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/company"
              className="inline-flex items-center justify-center p-1.5 rounded-neo border-2 border-black dark:border-white bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              title="Back to Overview"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </Link>
            <h1 className="font-black text-lg sm:text-xl tracking-tight text-black dark:text-white">
              {currentJob.title}
            </h1>
            <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-neo bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              ₹{currentJob.ctc_lpa} LPA
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-2 pl-0 sm:pl-9">
            <Building className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
            <span className="font-bold text-black dark:text-white">
              {currentJob.company_name}
            </span>
            <span>·</span>
            <span>Candidate Pool:</span>
            <span className="font-mono font-black text-black dark:text-white bg-[#7DD3FC] text-black px-1.5 py-0.5 rounded border border-black text-[11px]">
              {jobApplications.length} APPLICANTS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black text-xs shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 stroke-[2.5]" />
            <span>Schedule Round</span>
          </button>
          <button
            type="button"
            onClick={() => alert("Applicant CSV exported successfully!")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-neo bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white font-black text-xs shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Round Created Alert Notification */}
      {roundCreatedAlert && (
        <div className="p-3.5 rounded-neo bg-[#86EFAC] text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5] text-black shrink-0" />
            <span>
              New interview round scheduled! Automated notifications dispatched to shortlisted candidates.
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase bg-black text-white px-2 py-0.5 rounded">
            Live
          </span>
        </div>
      )}

      {/* 5-Column Kanban Board - Neobrutalism Design */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start overflow-x-auto pb-6">
        {STAGES.map((col) => {
          const stageApps = jobApplications.filter((a) => a.stage === col.key);

          return (
            <div
              key={col.key}
              className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-neo p-3 flex flex-col space-y-3 min-w-[240px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-white">
                <span
                  className={`${col.bg} text-black border-2 border-black text-[11px] font-black uppercase px-2 py-0.5 rounded shadow-[2px_2px_0px_0px_#000]`}
                >
                  {col.label}
                </span>
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-full border-2 border-black dark:border-white bg-[#F5EEDB] dark:bg-zinc-800 text-black dark:text-white">
                  {stageApps.length}
                </span>
              </div>

              {/* Cards Column List */}
              <div className="flex flex-col space-y-2.5 min-h-[320px]">
                {stageApps.length === 0 ? (
                  <div className="p-6 text-center text-zinc-400 dark:text-zinc-500 text-xs font-mono font-medium border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-neo">
                    No candidates
                  </div>
                ) : (
                  stageApps.map((app) => (
                    <div
                      key={app.id}
                      className="bg-[#FAF7EE] dark:bg-zinc-800/90 border-2 border-black dark:border-white rounded-neo p-3 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[3px_3px_0px_0px_#fff] transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div>
                          <p className="text-xs font-black text-black dark:text-white leading-tight">
                            {app.student.full_name}
                          </p>
                          <p className="font-mono text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 mt-0.5">
                            {app.student.roll_no} · {app.student.department_code}
                          </p>
                        </div>
                        <span className="font-mono text-[10px] font-black bg-[#FFE600] text-black border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_0px_#000] shrink-0">
                          {app.student.cgpa.toFixed(1)} CGPA
                        </span>
                      </div>

                      {/* Contact Details Privacy Shield (Rules.md §4.4) */}
                      {col.key === "APPLIED" ? (
                        <div className="flex items-center gap-1.5 py-1 px-2 rounded border border-black/40 bg-zinc-200/80 dark:bg-zinc-700/80 text-[10px] text-zinc-700 dark:text-zinc-300 font-mono">
                          <Lock className="w-3 h-3 text-zinc-600 dark:text-zinc-400 shrink-0" />
                          <span className="italic truncate font-medium">Hidden until shortlisted</span>
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 border border-black dark:border-white/40 rounded p-1.5 space-y-0.5 text-zinc-800 dark:text-zinc-200">
                          <p className="truncate font-semibold">{app.student.email}</p>
                          <p className="font-medium">{app.student.phone}</p>
                        </div>
                      )}

                      {/* Quick Move Action Buttons */}
                      <div className="pt-2 border-t border-black/20 dark:border-white/20 flex items-center justify-between gap-1">
                        {col.key !== "REJECTED" && col.key !== "SELECTED" && (
                          <button
                            type="button"
                            onClick={() => moveStage(app.id, "REJECTED")}
                            className="text-[10px] font-black text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                          >
                            Reject
                          </button>
                        )}
                        <div className="flex items-center gap-1.5 ml-auto">
                          {col.key === "APPLIED" && (
                            <button
                              type="button"
                              onClick={() => moveStage(app.id, "SHORTLISTED")}
                              className="px-2 py-1 rounded bg-[#7DD3FC] text-black border border-black text-[10px] font-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 active:shadow-none transition-all cursor-pointer"
                            >
                              Shortlist →
                            </button>
                          )}
                          {col.key === "SHORTLISTED" && (
                            <button
                              type="button"
                              onClick={() => moveStage(app.id, "IN_INTERVIEW")}
                              className="px-2 py-1 rounded bg-[#A388EE] text-black border border-black text-[10px] font-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 active:shadow-none transition-all cursor-pointer"
                            >
                              Interview →
                            </button>
                          )}
                          {col.key === "IN_INTERVIEW" && (
                            <button
                              type="button"
                              onClick={() => moveStage(app.id, "SELECTED")}
                              className="px-2 py-1 rounded bg-[#86EFAC] text-black border border-black text-[10px] font-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 active:shadow-none transition-all cursor-pointer"
                            >
                              Select Offer ★
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Interview Modal */}
      {scheduleModalOpen && (
        <Modal
          isOpen={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          title="Schedule Interview Round"
        >
          <form onSubmit={handleScheduleRound} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Round Title
              </label>
              <input
                type="text"
                required
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                className="w-full px-3 py-2 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-xs text-black dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
              />
            </div>
            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-xs text-black dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
              />
            </div>
            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Meeting / Venue URL
              </label>
              <input
                type="url"
                required
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full px-3 py-2 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-xs text-black dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="px-3.5 py-2 rounded-neo bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white font-bold text-xs shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black text-xs shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                Confirm & Dispatch Alerts
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
