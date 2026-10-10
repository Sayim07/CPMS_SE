import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { MOCK_DEPARTMENTS } from "../../mock/mockData";
import {
  Briefcase,
  CheckCircle2,
  ArrowLeft,
  Info,
} from "lucide-react";

export const CreateJobDrivePage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ctcLpa: 10.0,
    minCgpa: 7.0,
    maxBacklogs: 0,
    selectedDepartments: ["CSE", "IT"],
    deadlineDate: "2026-11-20",
    deadlineTime: "18:30",
  });

  const [submitted, setSubmitted] = useState(false);

  const toggleDepartment = (code: string) => {
    setFormData((prev) => {
      const exists = prev.selectedDepartments.includes(code);
      return {
        ...prev,
        selectedDepartments: exists
          ? prev.selectedDepartments.filter((c) => c !== code)
          : [...prev.selectedDepartments, code],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.selectedDepartments.length === 0) {
      alert("Please select at least one eligible academic department.");
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      navigate("/company");
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/company"
          className="text-xs font-medium text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Drives Console</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Post Campus Recruitment Drive</h1>
        <p className="text-xs text-slate-500 mt-1">
          Specify role cutoffs and eligibility criteria for the 2026 graduating batch.
        </p>
      </div>

      {/* TPO Approval Disclaimer (REQ-8) */}
      <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold">Workflow Rule: Mandatory TPO Verification</h4>
          <p className="text-indigo-700 mt-0.5">
            Drives submitted by corporate recruiters initialize with status <span className="font-mono font-bold">PENDING_APPROVAL</span>. The Placement Cell reviews your requirements before the drive is published to students (REQ-8).
          </p>
        </div>
      </div>

      {submitted && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Drive successfully submitted! TPO has been notified for review. Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
        {/* Basic Role Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Role Specifications</span>
          </h3>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Job / Designation Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Software Development Engineer — Frontend"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Detailed Job Description & Requirements</label>
            <textarea
              required
              rows={4}
              placeholder="Describe tech stack, key responsibilities, selection rounds, and office location..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Eligibility Criteria (Schema.md §1) */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100">
            Eligibility Cutoffs (Server Automated)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Annual CTC Package (LPA)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                required
                value={formData.ctcLpa}
                onChange={(e) => setFormData({ ...formData, ctcLpa: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md font-semibold font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">&gt; 8 LPA triggers Single Offer Lock</span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Minimum CGPA Cutoff</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                value={formData.minCgpa}
                onChange={(e) => setFormData({ ...formData, minCgpa: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md font-semibold font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Maximum Active Backlogs</label>
              <input
                type="number"
                min="0"
                max="10"
                required
                value={formData.maxBacklogs}
                onChange={(e) => setFormData({ ...formData, maxBacklogs: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md font-semibold font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-2">Eligible Academic Departments</label>
            <div className="flex flex-wrap gap-2">
              {MOCK_DEPARTMENTS.map((dept) => {
                const selected = formData.selectedDepartments.includes(dept.code);
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => toggleDepartment(dept.code)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      selected
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {dept.code} — {dept.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Deadline */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100">
            Application Window Deadline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Deadline Date</label>
              <input
                type="date"
                required
                value={formData.deadlineDate}
                onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Deadline Time (IST)</label>
              <input
                type="time"
                required
                value={formData.deadlineTime}
                onChange={(e) => setFormData({ ...formData, deadlineTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 block font-mono">
            Auto-close cron runs every 1 minute once deadline passes (REQ-9).
          </span>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Link to="/company">
            <Button type="button" variant="secondary" size="md">
              Cancel
            </Button>
          </Link>

          <Button type="submit" variant="primary" size="md">
            Submit Drive for TPO Approval
          </Button>
        </div>
      </form>
    </div>
  );
};
