import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { FileDropzone } from "../../components/ui/FileDropzone";
import { MOCK_STUDENTS, type Student } from "../../mock/mockData";
import {
  User,
  GraduationCap,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Save,
} from "lucide-react";

export const StudentProfilePage: React.FC = () => {
  const { user } = useAuth();
  const currentStudent: Student =
    MOCK_STUDENTS.find((s) => s.id === user.id) || MOCK_STUDENTS[0];

  const [formData, setFormData] = useState({
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

  const [isVerified, setIsVerified] = useState(currentStudent.is_verified);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetWarning, setResetWarning] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Rule REQ-5: Flag verification reset if CGPA or backlogs are edited on a verified student
    if (isVerified && (field === "cgpa" || field === "activeBacklogs")) {
      setResetWarning(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetWarning) {
      setIsVerified(false);
      setResetWarning(false);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Profile & Resume</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your official collegiate academic credentials and active PDF placement resume.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isVerified ? (
            <Badge variant="eligible">Verified by TPO</Badge>
          ) : (
            <Badge variant="warning">Verification Pending</Badge>
          )}
        </div>
      </div>

      {/* Verification Reset Warning Banner (REQ-5) */}
      {resetWarning && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Notice: Editing CGPA or Backlogs resets TPO Verification</h4>
            <p className="text-amber-700 mt-0.5">
              Per university policy (Rules.md §4), saving modifications to your CGPA or active backlogs will temporarily revoke your verified status and alert the Placement Officer for re-verification.
            </p>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile changes successfully updated.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Academic Details Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">Academic Intake Credentials</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                disabled
                value={formData.rollNo}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md font-mono text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Managed by Placement Cell</span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Department</label>
              <input
                type="text"
                disabled
                value={`${formData.departmentCode} — Computer Science`}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Cumulative CGPA (0.00 – 10.00)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={formData.cgpa}
                onChange={(e) => handleInputChange("cgpa", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Active Backlogs Count</label>
              <input
                type="number"
                min="0"
                required
                value={formData.activeBacklogs}
                onChange={(e) => handleInputChange("activeBacklogs", parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">10th Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.tenthPct}
                onChange={(e) => handleInputChange("tenthPct", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">12th Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.twelfthPct}
                onChange={(e) => handleInputChange("twelfthPct", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">Personal & Contact Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Institutional Email</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md font-mono text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Primary Phone Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Graduation Batch Year</label>
              <input
                type="text"
                disabled
                value={formData.batchYear}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md font-mono text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Resume Dropzone Section (Schema.md §5.2) */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">Placement Resume (PDF)</h3>
            </div>
            <span className="text-[11px] text-slate-400">Strictly PDF &lt; 2 MB</span>
          </div>

          <FileDropzone
            currentFileName="Asha_Roy_Resume_2026.pdf"
            currentUploadedAt="2026-10-01T08:00:00Z"
            onFileSelect={() => {}}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" className="gap-2">
            <Save className="w-4 h-4" />
            <span>Save Profile Updates</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
