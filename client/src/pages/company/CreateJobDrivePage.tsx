import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useDynamicData } from "../../hooks/useDynamicData";
import { MOCK_DEPARTMENTS } from "../../mock/mockData";
import {
  Briefcase,
  CheckCircle2,
  ArrowLeft,
  Info,
} from "lucide-react";

export const CreateJobDrivePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createJob, companies } = useDynamicData();
  const currentCompany =
    companies.find(
      (c) => c.id === user?.id || (c.email && c.email === user?.email)
    ) ||
    companies[0] ||
    null;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ctcLpa: 12.0,
    minCgpa: 7.5,
    maxBacklogs: 0,
    selectedDepartments: ["CSE", "IT"],
    deadlineDate: "2026-11-30",
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

    createJob({
      title: formData.title.trim(),
      description: formData.description.trim(),
      ctc_lpa: Number(formData.ctcLpa),
      min_cgpa: Number(formData.minCgpa),
      max_backlogs: Number(formData.maxBacklogs),
      department_codes: formData.selectedDepartments,
      company_name: currentCompany?.company_name || user?.companyName || "Corporate Partner",
      company_id: currentCompany?.id || `cmp-${Date.now()}`,
      application_deadline: `${formData.deadlineDate}T${formData.deadlineTime}:00Z`,
    });

    setSubmitted(true);
    setTimeout(() => {
      navigate("/company");
    }, 1200);
  };

  if (!currentCompany) {
    return (
      <div className="space-y-6 max-w-2xl text-black dark:text-white">
        <div className="p-8 rounded-neo bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-neo bg-[#7DD3FC] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-black">
            <Briefcase className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black uppercase">No Corporate Partner Profile Registered</h2>
          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            Please register your corporate organization profile first to post recruitment drives and define hiring criteria.
          </p>
          <div className="pt-2">
            <Link
              to="/register/company"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-neo bg-[#7DD3FC] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <span>Register Corporate Partner →</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl text-black dark:text-white">
      {/* Top Breadcrumb & Heading */}
      <div>
        <Link
          to="/company"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white text-xs font-bold shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Back to Drives Console</span>
        </Link>
        <h1 className="text-2xl font-black text-black dark:text-white mt-3 tracking-tight">
          Post Campus Recruitment Drive
        </h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-1">
          Specify role cutoffs, CTC compensation, and eligibility criteria for the 2026 graduating batch.
        </p>
      </div>

      {/* TPO Approval Disclaimer (REQ-8) */}
      <div className="p-4 rounded-neo bg-[#FFE600] text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-black shrink-0 mt-0.5 stroke-[2.5]" />
        <div>
          <h4 className="font-black uppercase tracking-wide">
            Workflow Rule: Mandatory TPO Verification
          </h4>
          <p className="text-black/90 font-medium mt-0.5">
            Drives submitted by corporate recruiters initialize with status{" "}
            <span className="font-mono font-black bg-black text-white px-1.5 py-0.5 rounded">
              PENDING_APPROVAL
            </span>
            . The Placement Cell reviews your requirements before the drive is published to students (REQ-8).
          </p>
        </div>
      </div>

      {submitted && (
        <div className="p-4 rounded-neo bg-[#86EFAC] text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs font-black flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-black shrink-0 stroke-[2.5]" />
          <span>
            Drive successfully submitted! TPO has been notified for review. Redirecting...
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 rounded-neo border-2 border-black dark:border-white p-6 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] space-y-6 text-xs"
      >
        {/* Basic Role Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-black dark:text-white pb-2 border-b-2 border-black dark:border-white flex items-center gap-2 uppercase tracking-wide">
            <Briefcase className="w-4 h-4 stroke-[2.5]" />
            <span>Role Specifications</span>
          </h3>

          <div>
            <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
              Job / Designation Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Software Development Engineer — Frontend"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-neo bg-[#FAF7EE] dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-xs text-black dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
            />
          </div>

          <div>
            <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
              Detailed Job Description & Requirements
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe tech stack, key responsibilities, selection rounds, and office location..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-neo bg-[#FAF7EE] dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-xs text-black dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
            />
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-black text-black dark:text-white pb-2 border-b-2 border-black dark:border-white uppercase tracking-wide">
            Eligibility Cutoffs (Server Automated)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Annual CTC Package (LPA)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                required
                value={formData.ctcLpa}
                onChange={(e) =>
                  setFormData({ ...formData, ctcLpa: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-neo bg-[#FAF7EE] dark:bg-zinc-800 border-2 border-black dark:border-white font-mono font-bold text-xs text-black dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
              />
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mt-1 block">
                &gt; 8 LPA triggers Single Offer Lock
              </span>
            </div>

            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Minimum CGPA Cutoff
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                value={formData.minCgpa}
                onChange={(e) =>
                  setFormData({ ...formData, minCgpa: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-neo bg-[#FAF7EE] dark:bg-zinc-800 border-2 border-black dark:border-white font-mono font-bold text-xs text-black dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
              />
            </div>

            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Max Active Backlogs
              </label>
              <input
                type="number"
                min="0"
                max="10"
                required
                value={formData.maxBacklogs}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxBacklogs: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-2 rounded-neo bg-[#FAF7EE] dark:bg-zinc-800 border-2 border-black dark:border-white font-mono font-bold text-xs text-black dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
              />
            </div>
          </div>

          <div>
            <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-2">
              Eligible Academic Departments
            </label>
            <div className="flex flex-wrap gap-2.5">
              {MOCK_DEPARTMENTS.map((dept) => {
                const selected = formData.selectedDepartments.includes(dept.code);
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => toggleDepartment(dept.code)}
                    className={`px-3 py-1.5 rounded-neo text-xs font-bold border-2 border-black dark:border-white transition-all cursor-pointer ${
                      selected
                        ? "bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000] font-black"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
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
          <h3 className="text-sm font-black text-black dark:text-white pb-2 border-b-2 border-black dark:border-white uppercase tracking-wide">
            Application Window Deadline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Deadline Date
              </label>
              <input
                type="date"
                required
                value={formData.deadlineDate}
                onChange={(e) =>
                  setFormData({ ...formData, deadlineDate: e.target.value })
                }
                className="w-full px-3 py-2 rounded-neo bg-[#FAF7EE] dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-xs text-black dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
              />
            </div>

            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Deadline Time (IST)
              </label>
              <input
                type="time"
                required
                value={formData.deadlineTime}
                onChange={(e) =>
                  setFormData({ ...formData, deadlineTime: e.target.value })
                }
                className="w-full px-3 py-2 rounded-neo bg-[#FAF7EE] dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-xs text-black dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
              />
            </div>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block">
            Auto-close cron runs every 1 minute once deadline passes (REQ-9).
          </span>
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t-2 border-black dark:border-white flex items-center justify-between">
          <Link to="/company">
            <button
              type="button"
              className="px-4 py-2 rounded-neo bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white font-bold text-xs shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
            >
              Cancel
            </button>
          </Link>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black text-xs shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            Submit Drive for TPO Approval →
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJobDrivePage;
