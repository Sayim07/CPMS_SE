import React, { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  MOCK_COMPANIES,
  MOCK_JOBS,
  type Company,
  type Job,
} from "../../mock/mockData";
import {
  Building2,
  Briefcase,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Layers,
} from "lucide-react";

export const TpoApprovalsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"companies" | "jobs">("companies");
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApproveCompany = (id: string, name: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "APPROVED" } : c))
    );
    showToast(`Corporate partner "${name}" has been approved for campus recruitment.`);
  };

  const handleRejectCompany = (id: string, name: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "REJECTED" } : c))
    );
    showToast(`Corporate partner "${name}" registration has been rejected.`);
  };

  const handleApproveJob = (id: string, title: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: "ACTIVE" } : j))
    );
    showToast(`Job drive "${title}" approved and published to all eligible students.`);
  };

  const handleCloseJob = (id: string, title: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: "CLOSED" } : j))
    );
    showToast(`Job drive "${title}" is now officially closed to new applications.`);
  };

  const pendingCompaniesCount = companies.filter((c) => c.status === "PENDING").length;
  const pendingJobsCount = jobs.filter((j) => j.status === "PENDING_APPROVAL").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Corporate & Drive Governance Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional vetting for employer entities and campus recruitment schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-md">
            Pending Queue: <span className="font-bold text-amber-600">{pendingCompaniesCount + pendingJobsCount}</span>
          </span>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-md flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Tab Controls */}
      <div className="flex border-b border-slate-200 gap-6 text-sm">
        <button
          onClick={() => setActiveTab("companies")}
          className={`pb-3 font-medium flex items-center gap-2 transition-colors relative ${
            activeTab === "companies"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Corporate Partners</span>
          {pendingCompaniesCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
              {pendingCompaniesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          className={`pb-3 font-medium flex items-center gap-2 transition-colors relative ${
            activeTab === "jobs"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Job Recruitment Drives</span>
          {pendingJobsCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
              {pendingJobsCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Corporate Partners */}
      {activeTab === "companies" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Employer Registration Directory</h3>
                <p className="text-xs text-slate-500">
                  Verify employer identity and tax credentials before granting portal access
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">Total: {companies.length}</span>
            </div>

            <div className="divide-y divide-slate-100">
              {companies.map((company) => (
                <div key={company.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-sm text-slate-900">{company.company_name}</h4>
                      {company.status === "APPROVED" && (
                        <Badge variant="eligible" size="sm">
                          Approved Partner
                        </Badge>
                      )}
                      {company.status === "PENDING" && (
                        <Badge variant="warning" size="sm">
                          Pending Approval
                        </Badge>
                      )}
                      {company.status === "REJECTED" && (
                        <Badge variant="mismatch" size="sm">
                          Rejected
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
                      <span>
                        GST/Tax ID: <strong className="text-slate-800">{company.gst_tax_id}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        HR Contact: <strong className="text-slate-800">{company.contact_person}</strong> ({company.contact_phone})
                      </span>
                      <span>·</span>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 font-sans"
                      >
                        {company.website} <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {company.status === "PENDING" ? (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRejectCompany(company.id, company.company_name)}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" />
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApproveCompany(company.id, company.company_name)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Approve Partner
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Vetting Complete</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Job Recruitment Drives */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Campus Placement Job Drives</h3>
                <p className="text-xs text-slate-500">
                  Review CTC criteria, department eligibility, and publish drives live to students
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">Total: {jobs.length}</span>
            </div>

            <div className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-sm text-slate-900">{job.title}</h4>
                      <span className="text-xs text-slate-500">({job.company_name})</span>
                      {job.status === "ACTIVE" && (
                        <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Drive
                        </span>
                      )}
                      {job.status === "PENDING_APPROVAL" && (
                        <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Awaiting TPO Approval
                        </span>
                      )}
                      {job.status === "CLOSED" && (
                        <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-slate-100 text-slate-600 border border-slate-200">
                          Closed
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {job.ctc_lpa.toFixed(1)} LPA
                      </span>
                      <span className="text-slate-500">
                        Min CGPA: <strong className="text-slate-800">{job.min_cgpa.toFixed(1)}</strong>
                      </span>
                      <span className="text-slate-500">
                        Max Backlogs: <strong className="text-slate-800">{job.max_backlogs}</strong>
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Depts:</span>
                        {job.department_codes.map((dept) => (
                          <span
                            key={dept}
                            className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 text-[10px] font-mono font-semibold"
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                      <span className="text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {job.status === "PENDING_APPROVAL" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApproveJob(job.id, job.title)}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        Approve & Publish
                      </Button>
                    )}
                    {job.status === "ACTIVE" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCloseJob(job.id, job.title)}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                        Close Applications
                      </Button>
                    )}
                    {job.status === "CLOSED" && (
                      <span className="text-xs text-slate-400 italic">Drive Inactive</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Institutional Policy Footnote */}
      <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 flex items-start gap-3 text-xs text-slate-600">
        <Layers className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Deterministic Approval Workflow:</span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Approving a Job Drive immediately schedules eligibility evaluation for all 120 registered students.
            Students matching all criteria will see this drive highlighted with the "Eligible" badge.
          </p>
        </div>
      </div>
    </div>
  );
};
