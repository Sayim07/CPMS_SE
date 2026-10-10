import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import {
  MOCK_JOBS,
  MOCK_APPLICATIONS,
  type Application,
} from "../../mock/mockData";
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  Video,
  Lock,
} from "lucide-react";

export const ApplicantKanbanPage: React.FC = () => {
  const currentJob = MOCK_JOBS[0]; // Acme Technologies SDE

  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [roundName, setRoundName] = useState("Technical Round 2 (System Architecture)");
  const [scheduledTime, setScheduledTime] = useState("2026-10-22T10:00");
  const [meetingLink, setMeetingLink] = useState("https://meet.example.com/acme-round2");
  const [roundCreatedAlert, setRoundCreatedAlert] = useState(false);

  // 5 Kanban Columns
  const STAGES: Array<"APPLIED" | "SHORTLISTED" | "IN_INTERVIEW" | "SELECTED" | "REJECTED"> = [
    "APPLIED",
    "SHORTLISTED",
    "IN_INTERVIEW",
    "SELECTED",
    "REJECTED",
  ];

  const moveStage = (appId: string, newStage: Application["stage"]) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        // Unmask contact details once moving past APPLIED (Rules.md §4.4)
        const unmaskedStudent = { ...app.student };
        if (newStage !== "APPLIED" && newStage !== "REJECTED") {
          unmaskedStudent.email = unmaskedStudent.email || "student@college.edu";
          unmaskedStudent.phone = unmaskedStudent.phone || "9876543210";
        }
        return {
          ...app,
          stage: newStage,
          student: unmaskedStudent,
        };
      })
    );
  };

  const handleScheduleRound = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleModalOpen(false);
    setRoundCreatedAlert(true);
    setTimeout(() => setRoundCreatedAlert(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <Link
            to="/company"
            className="text-xs font-medium text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1.5 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Corporate Console</span>
          </Link>
          <div className="flex items-center gap-2.5 mt-1">
            <h1 className="text-2xl font-bold text-slate-900">{currentJob.title}</h1>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              {currentJob.ctc_lpa} LPA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Min CGPA: {currentJob.min_cgpa} · Depts: {currentJob.department_codes.join(", ")} · {applications.length} Candidates in Pipeline
          </p>
        </div>

        {/* Global Pipeline Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => alert("Simulating authenticated zip download of all shortlisted candidate resumes (REQ-15)...")}
            className="gap-1.5 text-xs h-8"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download Resumes (ZIP)</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setScheduleModalOpen(true)}
            className="gap-1.5 text-xs h-8"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Schedule Round</span>
          </Button>
        </div>
      </div>

      {roundCreatedAlert && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Interview round scheduled! In-app notifications & calendar emails dispatched to all shortlisted applicants.</span>
        </div>
      )}

      {/* 5-Column Kanban Board (Design.md §2) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
        {STAGES.map((colStage) => {
          const colApps = applications.filter((a) => a.stage === colStage);

          return (
            <div
              key={colStage}
              className="bg-slate-100/70 border border-slate-200/80 rounded-lg p-3 min-h-[500px] flex flex-col justify-between"
            >
              <div>
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/80">
                  <span className="text-xs font-semibold text-slate-700 tracking-tight">
                    {colStage === "IN_INTERVIEW" ? "In Interview" : colStage.charAt(0) + colStage.slice(1).toLowerCase()}
                  </span>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shadow-2xs">
                    {colApps.length}
                  </span>
                </div>

                {/* Candidate Cards */}
                <div className="space-y-2.5">
                  {colApps.map((app) => {
                    const isMasked = app.stage === "APPLIED";

                    return (
                      <div
                        key={app.id}
                        className="bg-white rounded-md border border-slate-200 p-3 shadow-2xs hover:border-slate-300 transition-all space-y-2"
                      >
                        {/* Candidate Name & Dept */}
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-semibold text-slate-900 leading-snug">
                              {app.student.full_name}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400">
                              {app.student.roll_no} · {app.student.department_code}
                            </p>
                          </div>
                          <span className="text-[11px] font-bold font-mono text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                            {app.student.cgpa.toFixed(2)}
                          </span>
                        </div>

                        {/* Privacy Contact Masking (Rules.md §4.4) */}
                        <div className="text-[11px] pt-1 border-t border-slate-100">
                          {isMasked ? (
                            <span className="text-slate-400 italic flex items-center gap-1 font-mono">
                              <Lock className="w-3 h-3 text-slate-300" />
                              Hidden until shortlisted
                            </span>
                          ) : (
                            <div className="space-y-0.5 font-mono text-[10px] text-slate-600">
                              <p className="truncate">{app.student.email}</p>
                              <p>{app.student.phone}</p>
                            </div>
                          )}
                        </div>

                        {/* Resume preview trigger */}
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() => alert(`Opening 300s pre-signed S3 URL for ${app.student.full_name}'s resume...`)}
                            className="text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View Resume</span>
                          </button>
                        </div>

                        {/* Stage Transition Control Bar (AppFlow.md §5 State Machine) */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          {app.stage === "APPLIED" && (
                            <>
                              <button
                                type="button"
                                onClick={() => moveStage(app.id, "SHORTLISTED")}
                                className="flex-1 py-1 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
                              >
                                Shortlist &rarr;
                              </button>
                              <button
                                type="button"
                                onClick={() => moveStage(app.id, "REJECTED")}
                                className="px-2 py-1 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {app.stage === "SHORTLISTED" && (
                            <>
                              <button
                                type="button"
                                onClick={() => moveStage(app.id, "IN_INTERVIEW")}
                                className="flex-1 py-1 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                              >
                                Interview &rarr;
                              </button>
                              <button
                                type="button"
                                onClick={() => moveStage(app.id, "REJECTED")}
                                className="px-2 py-1 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {app.stage === "IN_INTERVIEW" && (
                            <>
                              <button
                                type="button"
                                onClick={() => moveStage(app.id, "SELECTED")}
                                className="flex-1 py-1 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              >
                                Select (Offer)
                              </button>
                              <button
                                type="button"
                                onClick={() => moveStage(app.id, "REJECTED")}
                                className="px-2 py-1 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {app.stage === "SELECTED" && (
                            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 w-full justify-center">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Offer Extended
                            </span>
                          )}

                          {app.stage === "REJECTED" && (
                            <span className="text-[10px] text-red-600 font-medium flex items-center gap-1 w-full justify-center">
                              <XCircle className="w-3 h-3 text-red-500" />
                              Archived
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Interview Round Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Interview Round"
        subtitle={`${currentJob.title} · ${currentJob.company_name}`}
        maxWidth="md"
      >
        <form onSubmit={handleScheduleRound} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Interview Round Title</label>
            <input
              type="text"
              required
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Scheduled Date & Time (IST)</label>
            <input
              type="datetime-local"
              required
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Meeting Link or Campus Venue</label>
            <input
              type="text"
              required
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <p className="text-[11px] text-slate-400">
            Broadcasting round will send in-app alerts and Nodemailer emails to all applicants in stage SHORTLISTED and IN_INTERVIEW.
          </p>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <Button type="button" variant="secondary" size="sm" onClick={() => setScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Confirm & Dispatch Broadcast
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
