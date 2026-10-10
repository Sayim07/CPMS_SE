import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { useAuth, type Role } from "@/context/AuthContext";
import {
  GraduationCap,
  Briefcase,
  FileText,
  UserCheck,
  Building2,
  Users,
  CheckCircle2,
  BarChart3,
  Settings,
  ShieldAlert,
  Bell,
  Command as CommandIcon,
} from "lucide-react";

export const CommandMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setRole } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string, role?: Role) => {
    if (role) {
      setRole(role);
    }
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Topbar Quick Launcher Button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition-all shadow-sm"
        title="Open Command Palette (Ctrl+K)"
      >
        <CommandIcon className="w-3.5 h-3.5 text-slate-400" />
        <span>Quick Jump...</span>
        <kbd className="ml-2 font-mono text-[10px] bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-500 font-semibold shadow-xs">
          Ctrl K
        </kbd>
      </button>

      {/* Animated Dialog Palette */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a destination, role, or action..." />
        <CommandList className="max-h-80">
          <CommandEmpty>No matching command found.</CommandEmpty>

          {/* Student Hub */}
          <CommandGroup heading="Student Workspace">
            <CommandItem
              onSelect={() => handleSelect("/student", "STUDENT")}
              className="cursor-pointer"
            >
              <GraduationCap className="mr-2 h-4 w-4 text-indigo-600" />
              <span>Student Dashboard</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">STUDENT</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/student/jobs", "STUDENT")}
              className="cursor-pointer"
            >
              <Briefcase className="mr-2 h-4 w-4 text-indigo-600" />
              <span>Active Placement Drives & Eligibility</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">STUDENT</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/student/applications", "STUDENT")}
              className="cursor-pointer"
            >
              <FileText className="mr-2 h-4 w-4 text-indigo-600" />
              <span>My Applications Timeline & Interview Calls</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">STUDENT</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/student/profile", "STUDENT")}
              className="cursor-pointer"
            >
              <UserCheck className="mr-2 h-4 w-4 text-indigo-600" />
              <span>Academic Profile & PDF Resume</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">STUDENT</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Company Hub */}
          <CommandGroup heading="Recruiter & Company Workspace">
            <CommandItem
              onSelect={() => handleSelect("/company", "COMPANY")}
              className="cursor-pointer"
            >
              <Building2 className="mr-2 h-4 w-4 text-emerald-600" />
              <span>Recruiter Overview & Approvals</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">COMPANY</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/company/jobs/new", "COMPANY")}
              className="cursor-pointer"
            >
              <Briefcase className="mr-2 h-4 w-4 text-emerald-600" />
              <span>Post New Campus Recruitment Drive</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">COMPANY</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/company/jobs/active", "COMPANY")}
              className="cursor-pointer"
            >
              <Users className="mr-2 h-4 w-4 text-emerald-600" />
              <span>Applicant Pipeline (5-Stage Kanban)</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">COMPANY</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* TPO Hub */}
          <CommandGroup heading="Training & Placement Office (TPO)">
            <CommandItem
              onSelect={() => handleSelect("/tpo", "TPO")}
              className="cursor-pointer"
            >
              <CheckCircle2 className="mr-2 h-4 w-4 text-amber-600" />
              <span>TPO Command Center</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">TPO</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/tpo/students", "TPO")}
              className="cursor-pointer"
            >
              <Users className="mr-2 h-4 w-4 text-amber-600" />
              <span>Student Academic Verification Grid</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">TPO</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/tpo/approvals", "TPO")}
              className="cursor-pointer"
            >
              <Building2 className="mr-2 h-4 w-4 text-amber-600" />
              <span>Corporate & Drive Approvals</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">TPO</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/tpo/reports", "TPO")}
              className="cursor-pointer"
            >
              <BarChart3 className="mr-2 h-4 w-4 text-amber-600" />
              <span>Institutional Placement Analytics & CSV</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">TPO</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Admin Hub */}
          <CommandGroup heading="System Administration">
            <CommandItem
              onSelect={() => handleSelect("/admin/settings", "ADMIN")}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4 text-red-600" />
              <span>Single Offer Policy & Threshold Slider</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">ADMIN</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/admin/audit", "ADMIN")}
              className="cursor-pointer"
            >
              <ShieldAlert className="mr-2 h-4 w-4 text-red-600" />
              <span>Immutable System Audit Trail Logs</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">ADMIN</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/notifications")}
              className="cursor-pointer"
            >
              <Bell className="mr-2 h-4 w-4 text-slate-600" />
              <span>All Notification Alerts</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">GLOBAL</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
