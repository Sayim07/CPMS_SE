import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDynamicData } from "../../hooks/useDynamicData";
import { FileDropzone } from "../../components/ui/FileDropzone";
import {
  User,
  GraduationCap,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Save,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

export const StudentProfilePage: React.FC = () => {
  const { currentStudent, updateStudent } = useDynamicData();

  const [formData, setFormData] = useState({
    fullName: currentStudent?.full_name || "",
    email: currentStudent?.email || "",
    phone: currentStudent?.phone || "",
    rollNo: currentStudent?.roll_no || "",
    departmentCode: currentStudent?.department_code || "CSE",
    batchYear: currentStudent?.batch_year || 2026,
    cgpa: currentStudent?.cgpa || 0,
    tenthPct: currentStudent?.tenth_pct || 85.0,
    twelfthPct: currentStudent?.twelfth_pct || 85.0,
    activeBacklogs: currentStudent?.active_backlogs || 0,
  });

  const [isVerified, setIsVerified] = useState(currentStudent?.is_verified ?? false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetWarning, setResetWarning] = useState(false);

  useEffect(() => {
    if (currentStudent) {
      setFormData({
        fullName: currentStudent.full_name,
        email: currentStudent.email,
        phone: currentStudent.phone,
        rollNo: currentStudent.roll_no,
        departmentCode: currentStudent.department_code,
        batchYear: currentStudent.batch_year,
        cgpa: currentStudent.cgpa,
        tenthPct: currentStudent.tenth_pct,
        twelfthPct: currentStudent.twelfth_pct,
        activeBacklogs: currentStudent.active_backlogs,
      });
      setIsVerified(currentStudent.is_verified);
    }
  }, [currentStudent]);

  if (!currentStudent) {
    return (
      <div className="space-y-6 max-w-4xl text-black dark:text-white">
        <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-8 sm:p-12 rounded-neo shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-neo bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-black">
            <User className="w-7 h-7" />
          </div>
          <h2 className="font-black text-xl sm:text-2xl uppercase tracking-tight">
            No Student Profile Registered Yet
          </h2>
          <p className="text-xs sm:text-sm font-medium text-black/70 dark:text-white/70 max-w-md mx-auto">
            You have not registered or linked a student account. Complete student intake registration to manage your credentials and apply for active campus drives.
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

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Rule REQ-5: Flag verification reset if CGPA or backlogs are edited on a verified student
    if (isVerified && (field === "cgpa" || field === "activeBacklogs")) {
      setResetWarning(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateStudent(currentStudent.id, {
      full_name: formData.fullName,
      phone: formData.phone,
      cgpa: formData.cgpa,
      active_backlogs: formData.activeBacklogs,
      tenth_pct: formData.tenthPct,
      twelfth_pct: formData.twelfthPct,
    });

    setIsVerified(updated.is_verified);
    setResetWarning(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl text-black dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b-2 border-black dark:border-white">
        <div>
          <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">
            Academic Profile & Resume
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-1">
            Maintain your official collegiate academic credentials and active PDF placement resume.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-neo bg-[#86EFAC] text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000]">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>VERIFIED BY TPO</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-neo bg-[#FFE600] text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000]">
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
              <span>VERIFICATION PENDING</span>
            </span>
          )}
        </div>
      </div>

      {/* Verification Reset Warning Banner (REQ-5) */}
      {resetWarning && (
        <div className="p-4 rounded-neo bg-[#FFE600] text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-black shrink-0 mt-0.5 stroke-[2.5]" />
          <div>
            <h4 className="font-black uppercase tracking-wide">
              Notice: Editing CGPA or Backlogs resets TPO Verification
            </h4>
            <p className="text-black/90 font-medium mt-0.5">
              Per university policy (Rules.md §4), saving modifications to your CGPA or active backlogs will temporarily revoke your verified status and alert the Placement Officer for re-verification.
            </p>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-neo bg-[#86EFAC] text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs font-black flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-black shrink-0 stroke-[2.5]" />
          <span>
            Profile changes successfully updated in the system in real-time!
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Academic Details Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-neo border-2 border-black dark:border-white p-6 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-black dark:border-white">
            <GraduationCap className="w-4 h-4 stroke-[2.5]" />
            <h3 className="text-sm font-black text-black dark:text-white uppercase tracking-wider">
              Academic Intake Credentials
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Roll Number
              </label>
              <input
                type="text"
                disabled
                value={formData.rollNo}
                className="w-full px-3 py-2 rounded-neo bg-[#FAF7EE] dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-zinc-600 dark:text-zinc-400 cursor-not-allowed"
              />
              <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                Managed by Placement Cell
              </span>
            </div>

            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Department
              </label>
              <input
                type="text"
                disabled
                value={`${formData.departmentCode} — Engineering`}
                className="w-full px-3 py-2 rounded-neo bg-[#FAF7EE] dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-zinc-600 dark:text-zinc-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Cumulative CGPA (0.00 – 10.00)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={formData.cgpa}
                onChange={(e) => handleInputChange("cgpa", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white font-mono font-bold text-xs text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Active Backlogs Count
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.activeBacklogs}
                onChange={(e) => handleInputChange("activeBacklogs", parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white font-mono font-bold text-xs text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                10th Percentage (%)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.tenthPct}
                onChange={(e) => handleInputChange("tenthPct", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-xs text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                12th Percentage (%)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.twelfthPct}
                onChange={(e) => handleInputChange("twelfthPct", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-xs text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-neo border-2 border-black dark:border-white p-6 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-black dark:border-white">
            <User className="w-4 h-4 stroke-[2.5]" />
            <h3 className="text-sm font-black text-black dark:text-white uppercase tracking-wider">
              Personal & Contact Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="w-full px-3 py-2 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-xs text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3 py-2 rounded-neo bg-[#FAF7EE] dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-zinc-600 dark:text-zinc-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Primary Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-3 py-2 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-xs text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-black text-black dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Graduation Batch Year
              </label>
              <input
                type="text"
                disabled
                value={formData.batchYear}
                className="w-full px-3 py-2 rounded-neo bg-[#FAF7EE] dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-zinc-600 dark:text-zinc-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Resume Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-neo border-2 border-black dark:border-white p-6 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 stroke-[2.5]" />
              <h3 className="text-sm font-black text-black dark:text-white uppercase tracking-wider">
                Placement Resume (PDF)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">PDF &lt; 2 MB</span>
          </div>

          <FileDropzone
            currentFileName={`${formData.fullName.replace(/\s+/g, "_")}_Resume_2026.pdf`}
            currentUploadedAt="2026-10-01T08:00:00Z"
            onFileSelect={() => {}}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black text-xs shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Save Profile Updates</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfilePage;
