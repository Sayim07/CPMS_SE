import React, { useState } from "react";
import { useDynamicData } from "../../hooks/useDynamicData";
import { dynamicDataService } from "../../services/dataService";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import {
  Users,
  CheckCircle2,
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
  password?: string;
  is_active: boolean;
}

export const AdminUsersPage: React.FC = () => {
  const { settings, updateSettings } = useDynamicData();
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(settings.staff || []);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    password: "",
    department: "Placement Directorate",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.email.trim() || !newStaff.password.trim()) {
      showToast("Please provide TPO name, official email, and login password.");
      return;
    }
    if (newStaff.password.trim().length < 4) {
      showToast("Password must be at least 4 characters.");
      return;
    }

    const createdStaff: StaffUser = {
      id: `usr-tpo-${Date.now()}`,
      name: newStaff.name.trim(),
      email: newStaff.email.trim().toLowerCase(),
      role: "TPO",
      password: newStaff.password.trim(),
      department: newStaff.department.trim(),
      is_active: true,
    };

    const updated = [createdStaff, ...staffUsers];
    setStaffUsers(updated);
    updateSettings({ staff: updated });

    dynamicDataService.addAuditLog({
      action: "TPO_PROVISIONED",
      entity_type: "STAFF",
      entity_id: createdStaff.id,
      actor_role: "ADMIN",
      actor_email: "sayimmullick@gmail.com",
      details: {
        name: createdStaff.name,
        email: createdStaff.email,
        department: createdStaff.department,
      },
    });

    setAddStaffModalOpen(false);
    setNewStaff({
      name: "",
      email: "",
      password: "",
      department: "Placement Directorate",
    });
    showToast(`New TPO Officer account created for ${createdStaff.name} (${createdStaff.email}). Login password configured.`);
  };

  const handleToggleStaff = (id: string, name: string) => {
    const updated = staffUsers.map((u) => (u.id === id ? { ...u, is_active: !u.is_active } : u));
    setStaffUsers(updated);
    updateSettings({ staff: updated });
    const targetUser = updated.find((u) => u.id === id);
    const updatedStatus = targetUser?.is_active ?? true;

    dynamicDataService.addAuditLog({
      action: updatedStatus ? "STAFF_ACTIVATED" : "STAFF_DEACTIVATED",
      entity_type: "STAFF",
      entity_id: id,
      actor_role: "ADMIN",
      actor_email: "sayimmullick@gmail.com",
      details: { staff_name: name, is_active: updatedStatus },
    });

    showToast(`TPO Officer ${name} has been ${updatedStatus ? "activated" : "deactivated"}.`);
  };

  return (
    <div className="space-y-6 text-on-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-outline-variant/40">
        <div>
          <h1 className="font-headline-lg text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
            TPO Officers & Staff Management
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Add and manage placement cell officers who verify student profiles and coordinate placement drives
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => setAddStaffModalOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add TPO Officer
          </Button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 p-3.5 rounded-md flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 dark:text-emerald-400 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Governance Summary Tile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]">
          <span className="text-[10px] font-mono font-bold uppercase text-black/60 dark:text-white/60">
            Registered TPO Officers
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono text-2xl font-black">{staffUsers.length}</span>
            <span className="text-[10px] font-mono font-bold bg-[#FFE600] text-black px-1.5 py-0.5 rounded border border-black">
              ACTIVE ROSTER
            </span>
          </div>
        </div>

        <div className="p-4 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]">
          <span className="text-[10px] font-mono font-bold uppercase text-black/60 dark:text-white/60">
            System Administrator
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono text-xs font-bold truncate">sayimmullick@gmail.com</span>
            <span className="text-[10px] font-mono font-bold bg-[#FF70A6] text-black px-1.5 py-0.5 rounded border border-black">
              SUPER ADMIN
            </span>
          </div>
        </div>

        <div className="p-4 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]">
          <span className="text-[10px] font-mono font-bold uppercase text-black/60 dark:text-white/60">
            Role Hierarchy
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono text-xs font-bold">Admin → TPO → Company</span>
            <span className="text-[10px] font-mono font-bold bg-[#86EFAC] text-black px-1.5 py-0.5 rounded border border-black">
              ROLE BASED
            </span>
          </div>
        </div>
      </div>

      {/* TPO Officers Roster List */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg overflow-hidden shadow-xs">
        <div className="p-4 bg-surface-container-low border-b border-outline-variant/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-outline" />
            <div>
              <h3 className="text-sm font-semibold text-on-surface">Training & Placement Officers (TPO)</h3>
              <p className="text-xs text-on-surface-variant">Authorized TPO accounts provisioned by Super Admin</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setAddStaffModalOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add TPO Officer
          </Button>
        </div>

        {staffUsers.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Users className="w-8 h-8 text-outline mx-auto" />
            <h4 className="font-bold text-sm text-on-surface">No TPO Officers Provisioned Yet</h4>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Click "+ Add TPO Officer" above to provision authorized accounts for your placement cell staff.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/30">
            {staffUsers.map((staff) => (
              <div key={staff.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-surface-container-low/40 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-sm text-on-surface">{staff.name}</span>
                    <Badge variant={staff.is_active ? "eligible" : "neutral"} size="sm">
                      {staff.role}
                    </Badge>
                    {!staff.is_active && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-surface-container text-outline">
                        Suspended
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant font-data-mono">
                    <span>{staff.email}</span>
                    <span>·</span>
                    <span className="font-sans text-on-surface-variant">{staff.department}</span>
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
                        <UserX className="w-3.5 h-3.5 mr-1 text-outline" />
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
        )}
      </div>

      {/* RBAC Notice */}
      <div className="bg-surface-container-low border border-outline-variant/40 rounded-md p-3.5 flex items-start gap-3 text-xs text-on-surface-variant">
        <Lock className="w-4 h-4 text-outline shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-on-surface">Officer Permissions:</span>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            TPO Officers have access to verify student profiles, register recruiter companies, and approve placement drives. All accounts are managed securely.
          </p>
        </div>
      </div>

      {/* Add TPO Officer Modal */}
      {addStaffModalOpen && (
        <Modal
          isOpen={addStaffModalOpen}
          onClose={() => setAddStaffModalOpen(false)}
          title="Add New TPO Officer"
          subtitle="Create a login account for a placement cell officer"
        >
          <form onSubmit={handleAddStaffSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Arvind Sharma"
                value={newStaff.name}
                onChange={(e) => setNewStaff((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-surface-container-high rounded border border-outline-variant/50 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Official Institutional Email *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. arvind.sharma@college.edu"
                value={newStaff.email}
                onChange={(e) => setNewStaff((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-surface-container-high rounded border border-outline-variant/50 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Set TPO Login Password *
              </label>
              <input
                type="password"
                required
                placeholder="Enter login password for this TPO Officer"
                value={newStaff.password}
                onChange={(e) => setNewStaff((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-surface-container-high rounded border border-outline-variant/50 focus:outline-none focus:border-primary font-mono"
              />
              <span className="text-[10px] text-outline mt-1 block">
                The TPO Officer must use this exact password to sign in at /login.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Authorized Role
                </label>
                <div className="px-3 py-2 text-xs bg-surface-container-low rounded border border-outline-variant/50 font-bold text-primary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span>TPO Officer</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Department / Office *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Placement Directorate"
                  value={newStaff.department}
                  onChange={(e) =>
                    setNewStaff((prev) => ({ ...prev, department: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs bg-surface-container-high rounded border border-outline-variant/50 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/30">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAddStaffModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Create TPO Account
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
