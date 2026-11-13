import React, { useState, useEffect } from "react";
import { useDynamicData } from "../../hooks/useDynamicData";
import { Button } from "../../components/ui/Button";
import { type Department } from "../../mock/mockData";
import {
  Sliders,
  Shield,
  Building,
  CheckCircle2,
  Save,
  Lock,
} from "lucide-react";

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings } = useDynamicData();
  const [thresholdLpa, setThresholdLpa] = useState<number>(settings.singleOfferThresholdLpa || 8.0);
  const [departments, setDepartments] = useState<Department[]>(settings.departments);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    setThresholdLpa(settings.singleOfferThresholdLpa || 8.0);
    setDepartments(settings.departments);
  }, [settings]);

  const handleSavePolicy = () => {
    updateSettings({
      singleOfferThresholdLpa: thresholdLpa,
      departments,
    });
    showToast(`System settings & Single Offer Policy threshold (${thresholdLpa.toFixed(1)} LPA) saved.`);
  };

  const handleToggleDept = (id: string) => {
    const updated = departments.map((d) => (d.id === id ? { ...d, is_active: !d.is_active } : d));
    setDepartments(updated);
    updateSettings({ departments: updated });
    showToast("Department status updated in real-time.");
  };

  return (
    <div className="space-y-6 text-on-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-outline-variant/40">
        <div>
          <h1 className="font-headline-lg text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
            Placement Policies & Settings
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Configure Dream Offer salary thresholds and active college departments for placement drives
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

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Single Offer Policy Threshold */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/40">
            <div className="p-1.5 rounded bg-primary/10 text-primary">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-on-surface">Dream Offer Policy</h2>
              <p className="text-xs text-on-surface-variant">Minimum package required for a Dream Offer designation</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-medium text-on-surface-variant">Dream Offer Package Cutoff:</span>
                <span className="font-data-mono font-bold text-sm text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
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
                className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[11px] text-outline font-data-mono mt-1">
                <span>4.0 LPA</span>
                <span>8.0 LPA (Standard)</span>
                <span>15.0 LPA</span>
              </div>
            </div>

            <div className="p-3.5 bg-surface-container-low rounded-md border border-outline-variant/40 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-on-surface">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>How this policy works:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-on-surface-variant">
                <li>
                  Students who accept an offer of ₹{thresholdLpa.toFixed(1)} LPA or higher are considered placed and cannot apply for lower package drives.
                </li>
                <li>
                  Students who accept an offer below ₹{thresholdLpa.toFixed(1)} LPA can still upgrade by applying to Dream drives offering above ₹{thresholdLpa.toFixed(1)} LPA.
                </li>
                <li>
                  Ensures fair opportunities so multiple offers are distributed across the batch.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Department Governance */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/40">
            <div className="p-1.5 rounded bg-tertiary/10 text-tertiary">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-on-surface">Eligible College Departments</h2>
              <p className="text-xs text-on-surface-variant">Select which academic departments participate in campus placements</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="p-3 rounded-md border border-outline-variant/40 bg-surface-container-low flex items-center justify-between text-xs hover:bg-surface-container transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-data-mono font-bold text-on-surface bg-surface-container px-1.5 py-0.5 rounded text-[11px] border border-outline-variant/40">
                      {dept.code}
                    </span>
                    <span className="font-medium text-on-surface">{dept.name}</span>
                  </div>
                  <span className="text-[11px] text-outline font-data-mono">ID: {dept.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-medium ${
                      dept.is_active ? "text-tertiary font-semibold" : "text-outline"
                    }`}
                  >
                    {dept.is_active ? "Active" : "Disabled"}
                  </span>
                  <input
                    type="checkbox"
                    checked={dept.is_active}
                    onChange={() => handleToggleDept(dept.id)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security & Access Notice */}
      <div className="bg-surface-container-low border border-outline-variant/40 rounded-md p-3.5 flex items-start gap-3 text-xs text-on-surface-variant">
        <Lock className="w-4 h-4 text-outline shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-on-surface">Policy Enforcement:</span>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            Changes to the dream cutoff threshold or department availability take effect immediately across all active drives and student applications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
