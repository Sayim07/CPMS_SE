import React from "react";
import { StageChip } from "../../components/ui/StageChip";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  MOCK_APPLICATIONS,
  MOCK_JOBS,
} from "../../mock/mockData";
import {
  Building2,
  Video,
  Clock,
  ExternalLink,
} from "lucide-react";

export const StudentApplicationsPage: React.FC = () => {

  // Mock list of rounds scheduled
  const mockRounds: Record<string, { name: string; time: string; link: string }> = {
    "app-201": {
      name: "Technical Round 1 (System Design & DSA)",
      time: "Oct 15, 2026 at 10:00 AM IST",
      link: "https://meet.example.com/acme-sde-round1",
    },
    "app-204": {
      name: "HR & Culture Interview",
      time: "Oct 18, 2026 at 02:30 PM IST",
      link: "https://meet.example.com/cloudscale-interview",
    },
  };

  const applications = MOCK_APPLICATIONS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Application Funnel</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track recruitment progress, stage verdicts, and scheduled interview rounds across active drives.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono bg-slate-100 px-3 py-1 rounded">
          {applications.length} Submissions
        </div>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No applications submitted yet"
          description="Browse the campus placement board to review your eligibility and apply to companies."
          action={
            <Button variant="primary" size="sm" onClick={() => window.location.href = "/student/jobs"}>
              Browse Drives
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const job = MOCK_JOBS.find((j) => j.id === app.job_id);
            const round = mockRounds[app.id];

            return (
              <div
                key={app.id}
                className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4 transition-all hover:border-slate-300"
              >
                {/* Top Summary Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {job?.title || "Software Engineering Role"}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job?.company_name || "Company"}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono font-medium text-slate-700">{job?.ctc_lpa} LPA</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Applied {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                    <StageChip stage={app.stage} />
                  </div>
                </div>

                {/* Funnel Progress Steps */}
                <div className="py-1">
                  <div className="flex items-center justify-between max-w-lg text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5 text-indigo-600 font-semibold">
                      <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[10px]">
                        1
                      </div>
                      <span>Applied</span>
                    </div>

                    <div className="h-0.5 w-12 bg-slate-200" />

                    <div
                      className={`flex items-center gap-1.5 ${
                        app.stage !== "APPLIED" ? "text-indigo-600 font-semibold" : "text-slate-400"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px]">
                        2
                      </div>
                      <span>Shortlisted</span>
                    </div>

                    <div className="h-0.5 w-12 bg-slate-200" />

                    <div
                      className={`flex items-center gap-1.5 ${
                        app.stage === "IN_INTERVIEW" || app.stage === "SELECTED"
                          ? "text-indigo-600 font-semibold"
                          : "text-slate-400"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px]">
                        3
                      </div>
                      <span>Interview</span>
                    </div>

                    <div className="h-0.5 w-12 bg-slate-200" />

                    <div
                      className={`flex items-center gap-1.5 ${
                        app.stage === "SELECTED"
                          ? "text-emerald-600 font-semibold"
                          : app.stage === "REJECTED"
                          ? "text-red-600 font-semibold"
                          : "text-slate-400"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px]">
                        4
                      </div>
                      <span>Verdict</span>
                    </div>
                  </div>
                </div>

                {/* Scheduled Interview Round Alert */}
                {round && (
                  <div className="p-3.5 rounded-lg bg-sky-50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Video className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold text-sky-950">{round.name}</h4>
                        <p className="text-[11px] text-sky-700 font-mono mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{round.time}</span>
                        </p>
                      </div>
                    </div>

                    <a
                      href={round.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white border border-sky-200 text-xs font-medium text-sky-800 hover:bg-sky-100 transition-colors shrink-0"
                    >
                      <span>Join Meeting</span>
                      <ExternalLink className="w-3 h-3" />
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
