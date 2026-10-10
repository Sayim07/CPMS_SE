import React, { useState } from "react";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Badge } from "../../components/ui/Badge";
import { StageChip } from "../../components/ui/StageChip";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { MOCK_STUDENTS, type Student } from "../../mock/mockData";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export const TpoStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verificationSuccessAlert, setVerificationSuccessAlert] = useState<string | null>(null);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "ALL" || s.department_code === selectedDept;
    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "VERIFIED" && s.is_verified) ||
      (selectedStatus === "PENDING" && !s.is_verified);

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleOpenVerify = (student: Student) => {
    setSelectedStudent(student);
    setVerifyModalOpen(true);
  };

  const handleConfirmVerification = (status: boolean) => {
    if (!selectedStudent) return;
    setStudents((prev) =>
      prev.map((s) => (s.id === selectedStudent.id ? { ...s, is_verified: status } : s))
    );
    setVerifyModalOpen(false);
    setVerificationSuccessAlert(
      status
        ? `Student ${selectedStudent.full_name} (${selectedStudent.roll_no}) has been verified. Verification status active.`
        : `Student ${selectedStudent.full_name} (${selectedStudent.roll_no}) verification was flagged / revoked.`
    );
    setTimeout(() => setVerificationSuccessAlert(null), 4500);
  };

  const columns: Column<Student>[] = [
    {
      key: "roll_no",
      header: "Roll Number",
      render: (s) => (
        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {s.roll_no}
        </span>
      ),
    },
    {
      key: "full_name",
      header: "Candidate Name",
      render: (s) => (
        <div>
          <p className="font-medium text-slate-900 text-sm">{s.full_name}</p>
          <p className="text-xs text-slate-400 font-mono">{s.email}</p>
        </div>
      ),
    },
    {
      key: "department_code",
      header: "Department",
      render: (s) => (
        <span className="font-mono text-xs font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          {s.department_code}
        </span>
      ),
    },
    {
      key: "cgpa",
      header: "CGPA",
      render: (s) => (
        <span
          className={`font-semibold font-mono text-xs ${
            s.cgpa >= 8.0 ? "text-emerald-700" : s.cgpa >= 6.5 ? "text-slate-800" : "text-amber-700"
          }`}
        >
          {s.cgpa.toFixed(2)}
        </span>
      ),
    },
    {
      key: "active_backlogs",
      header: "Backlogs",
      render: (s) => (
        <span
          className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
            s.active_backlogs === 0
              ? "bg-slate-100 text-slate-700"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {s.active_backlogs}
        </span>
      ),
    },
    {
      key: "has_resume",
      header: "Resume",
      render: (s) =>
        s.has_resume ? (
          <a
            href={`/resumes/${s.roll_no}_resume.pdf`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              e.preventDefault();
              alert(`Simulating PDF preview for candidate ${s.full_name} (${s.roll_no}_resume.pdf)`);
            }}
            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            PDF <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
          </a>
        ) : (
          <span className="text-xs text-slate-400 italic">None</span>
        ),
    },
    {
      key: "is_verified",
      header: "Verification",
      render: (s) =>
        s.is_verified ? (
          <Badge variant="eligible" size="sm">
            Verified
          </Badge>
        ) : (
          <Badge variant="warning" size="sm">
            Pending
          </Badge>
        ),
    },
    {
      key: "placement_status",
      header: "Status",
      render: (s) => (
        <StageChip stage={s.placement_status === "PLACED" ? "SELECTED" : "APPLIED"} size="sm" />
      ),
    },
    {
      key: "actions",
      header: "Review",
      render: (s) => (
        <Button
          variant={s.is_verified ? "ghost" : "primary"}
          size="sm"
          onClick={() => handleOpenVerify(s)}
        >
          {s.is_verified ? "Inspect" : "Verify"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Academic Records & Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional verification database · Enforces REQ-5 tamper prevention
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-md font-mono">
            Total Candidates: <span className="font-bold text-slate-900">{students.length}</span> (
            <span className="text-amber-700 font-semibold">
              {students.filter((s) => !s.is_verified).length} pending
            </span>
            )
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {verificationSuccessAlert && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-md flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{verificationSuccessAlert}</span>
          </div>
          <button
            onClick={() => setVerificationSuccessAlert(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Roll No, Name or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">All Departments</option>
              <option value="CSE">Computer Science (CSE)</option>
              <option value="IT">Information Technology (IT)</option>
              <option value="ECE">Electronics (ECE)</option>
              <option value="MECH">Mechanical (MECH)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="PENDING">Pending TPO Review Only</option>
              <option value="VERIFIED">Verified Candidates Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        keyExtractor={(s) => s.id}
        page={1}
        pageSize={10}
        total={filteredStudents.length}
      />

      {/* Verification Modal Dialog */}
      {selectedStudent && (
        <Modal
          isOpen={verifyModalOpen}
          onClose={() => setVerifyModalOpen(false)}
          title={`Academic Verification: ${selectedStudent.full_name}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Roll Number:</span>
                  <p className="font-mono font-bold text-slate-900">{selectedStudent.roll_no}</p>
                </div>
                <div>
                  <span className="text-slate-400">Department:</span>
                  <p className="font-mono font-bold text-slate-900">{selectedStudent.department_code}</p>
                </div>
                <div>
                  <span className="text-slate-400">Current CGPA:</span>
                  <p className="font-mono font-bold text-slate-900">{selectedStudent.cgpa.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Active Backlogs:</span>
                  <p className="font-mono font-bold text-slate-900">{selectedStudent.active_backlogs}</p>
                </div>
                <div>
                  <span className="text-slate-400">10th Percentage:</span>
                  <p className="font-mono font-bold text-slate-900">{selectedStudent.tenth_pct}%</p>
                </div>
                <div>
                  <span className="text-slate-400">12th Percentage:</span>
                  <p className="font-mono font-bold text-slate-900">{selectedStudent.twelfth_pct}%</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-slate-500">Official Resume File:</span>
                {selectedStudent.has_resume ? (
                  <span className="font-mono text-indigo-700 flex items-center gap-1 font-medium">
                    <FileText className="w-3.5 h-3.5" />
                    {selectedStudent.roll_no}_resume.pdf
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Resume not uploaded
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-md bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Verification Authority Policy</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Approving this record certifies that university grade cards and enrollment criteria have been verified.
                If the student modifies their CGPA later, this approval automatically resets to Pending.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleConfirmVerification(false)}
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Flag / Revoke Verification
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setVerifyModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleConfirmVerification(true)}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Confirm & Mark Verified
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
