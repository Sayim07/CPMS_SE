import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { MOCK_DEPARTMENTS, type Department } from "../../mock/mockData";
import {
  Sliders,
  Shield,
  Users,
  Building,
  CheckCircle2,
  Save,
  Plus,
  Lock,
  UserCheck,
  UserX,
} from "lucide-react";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: "TPO" | "ADMIN";
  department: string;
  is_active: boolean;
}

export const AdminSettingsPage: React.FC = () => {
  const [thresholdLpa, setThresholdLpa] = useState<number>(8.0);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([
    {
      id: "usr-tpo-1",
      name: "Dr. Arvind Sharma",
      email: "arvind.sharma@college.edu",
      role: "TPO",
      department: "Placement Directorate",
      is_active: true,
    },
    {
      id: "usr-tpo-2",
      name: "Prof. Sunita Rao",
      email: "sunita.rao@college.edu",
      role: "TPO",
      department: "CSE Department Coordinator",
      is_active: true,
    },
    {
      id: "usr-adm-1",
      name: "IT Infrastructure Admin",
      email: "sysadmin@college.edu",
      role: "ADMIN",
      department: "University IT Center",
      is_active: true,
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSavePolicy = () => {
    showToast(`Single Offer Policy threshold successfully updated to ${thresholdLpa.toFixed(1)} LPA.`);
  };

  const handleToggleDept = (id: string) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, is_active: !d.is_active } : d))
    );
    showToast("Department status updated.");
  };

  const handleToggleStaff = (id: string, name: string) => {
    setStaffUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, is_active: !u.is_active } : u))
    );
    showToast(`Account status for ${name} toggled.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System Administration & Policy Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global placement cell parameters, threshold controls, and institutional roles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleSavePolicy}>
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save All Settings
          </Button>
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

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Single Offer Policy Threshold */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-1.5 rounded bg-indigo-50 text-indigo-700">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Single Offer Policy (Rules.md §4.1)</h2>
              <p className="text-xs text-slate-500">Threshold determining Dream Job participation</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-medium text-slate-700">Dream Offer CTC Cutoff:</span>
                <span className="font-mono font-bold text-sm text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {thresholdLpa.toFixed(1)} LPA
                </span>
              </div>
              <input
                type="range"
                min="4.0"
                max="15.0"
                step="0.5"
                value={thresholdLpa}
                onChange={(e) => setThresholdLpa(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                <span>4.0 LPA</span>
                <span>8.0 LPA (Standard)</span>
                <span>15.0 LPA</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Deterministic Enforcement Logic:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
                <li>
                  Any candidate who accepts an offer &ge; {thresholdLpa.toFixed(1)} LPA is locked from all future drives.
                </li>
                <li>
                  Any candidate with an offer &lt; {thresholdLpa.toFixed(1)} LPA is permitted to apply ONLY to dream drives offering &gt; {thresholdLpa.toFixed(1)} LPA.
                </li>
                <li>
                  Evaluated real-time in the backend eligibility engine (<span className="font-mono text-slate-700">SINGLE_OFFER_LOCK</span>).
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Department Governance */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-1.5 rounded bg-emerald-50 text-emerald-700">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Academic Department Governance</h2>
              <p className="text-xs text-slate-500">Participating departments in current placement season</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="p-3 rounded-md border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-50/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                      {dept.code}
                    </span>
                    <span className="font-medium text-slate-800">{dept.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">ID: {dept.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-medium ${
                      dept.is_active ? "text-emerald-700" : "text-slate-400"
                    }`}
                  >
                    {dept.is_active ? "Active" : "Disabled"}
                  </span>
                  <input
                    type="checkbox"
                    checked={dept.is_active}
                    onChange={() => handleToggleDept(dept.id)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Staff & Institutional Access Management */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Placement Officers & Administrators</h3>
              <p className="text-xs text-slate-500">Authorized institutional accounts with administrative privilege</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => showToast("Add Staff modal simulation: account intake prepared.")}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Staff Member
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {staffUsers.map((staff) => (
            <div key={staff.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-sm text-slate-900">{staff.name}</span>
                  <Badge variant={staff.role === "ADMIN" ? "mismatch" : "eligible"} size="sm">
                    {staff.role}
                  </Badge>
                  {!staff.is_active && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-500">
                      Suspended
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span>{staff.email}</span>
                  <span>·</span>
                  <span className="font-sans text-slate-600">{staff.department}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant={staff.is_active ? "ghost" : "primary"}
                  size="sm"
                  onClick={() => handleToggleStaff(staff.id, staff.name)}
                >
                  {staff.is_active ? (
                    <>
                      <UserX className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5 mr-1" />
                      Activate
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Access Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 flex items-start gap-3 text-xs text-slate-600">
        <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">RBAC Role-Based Access Control:</span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            TPO and ADMIN permissions are guarded by server-side JWT verification and append-only database audit logs.
            Changes to system settings are immutably recorded with actor ID, IP address, and delta timestamp.
          </p>
        </div>
      </div>
    </div>
  );
};
