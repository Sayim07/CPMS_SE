import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Briefcase,
  UserCheck,
  Building2,
  FileText,
  BarChart3,
  Settings,
  ShieldAlert,
  Bell,
  Menu,
  X,
  CheckCircle2,
  Users,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import { useAuth, type Role } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, setRole, unreadNotificationsCount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const location = useLocation();

  const getNavLinks = () => {
    switch (user.role) {
      case "STUDENT":
        return [
          { name: "Dashboard", path: "/student", icon: <GraduationCap className="w-4 h-4" /> },
          { name: "Placement Drives", path: "/student/jobs", icon: <Briefcase className="w-4 h-4" /> },
          { name: "My Applications", path: "/student/applications", icon: <FileText className="w-4 h-4" /> },
          { name: "Profile & Resume", path: "/student/profile", icon: <UserCheck className="w-4 h-4" /> },
        ];
      case "COMPANY":
        return [
          { name: "Overview", path: "/company", icon: <Building2 className="w-4 h-4" /> },
          { name: "Post Drive", path: "/company/jobs/new", icon: <Briefcase className="w-4 h-4" /> },
          { name: "Applicants & Pipeline", path: "/company/jobs/active", icon: <Users className="w-4 h-4" /> },
        ];
      case "TPO":
        return [
          { name: "TPO Queue", path: "/tpo", icon: <CheckCircle2 className="w-4 h-4" /> },
          { name: "Verify Students", path: "/tpo/students", icon: <Users className="w-4 h-4" /> },
          { name: "Recruiter Approvals", path: "/tpo/companies", icon: <Building2 className="w-4 h-4" /> },
          { name: "Drive Approvals", path: "/tpo/jobs", icon: <Briefcase className="w-4 h-4" /> },
          { name: "Reports & Analytics", path: "/tpo/reports", icon: <BarChart3 className="w-4 h-4" /> },
        ];
      case "ADMIN":
        return [
          { name: "User Management", path: "/admin/users", icon: <Users className="w-4 h-4" /> },
          { name: "System Settings", path: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
          { name: "Audit Logs", path: "/admin/audit", icon: <ShieldAlert className="w-4 h-4" /> },
          { name: "Placement Analytics", path: "/tpo/reports", icon: <BarChart3 className="w-4 h-4" /> },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to={`/${user.role.toLowerCase()}`} className="flex items-center text-slate-900">
              <span className="font-bold text-lg text-indigo-600 tracking-tight">CPMS</span>
              <span className="hidden md:inline-block ml-2.5 pl-2.5 border-l border-slate-200 text-xs font-medium text-slate-500">
                College Placement Management System
              </span>
            </Link>
          </div>

          {/* Right Header Utilities: Role Switcher Demo, Notification Bell, User Avatar */}
          <div className="flex items-center gap-3">
            {/* Prototype Role Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                title="Switch role for demo preview"
              >
                <span>Role: {user.role}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Preview Actor
                  </div>
                  {(["STUDENT", "COMPANY", "TPO", "ADMIN"] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRole(r);
                        setRoleSwitcherOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50",
                        user.role === r ? "font-bold text-indigo-600 bg-indigo-50/50" : "text-slate-700"
                      )}
                    >
                      <span>{r}</span>
                      {user.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
              )}
            </Link>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center">
                {user.fullName.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-slate-900 leading-none">{user.fullName}</p>
                <p className="text-[10px] text-slate-500 leading-none mt-1">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-8">
        {/* Desktop Sidebar Nav */}
        <aside className="hidden md:block w-56 shrink-0">
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Info Box in Sidebar */}
          <div className="mt-8 p-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Campus Status</p>
            <p className="text-[11px]">Academic Year: 2026 Batch</p>
            <p className="text-[11px] text-emerald-600 font-medium">Drive Season: Active</p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm">
            <div className="fixed inset-y-0 left-0 w-64 bg-white p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <span className="font-bold text-lg text-indigo-600">CPMS</span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded text-slate-500 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="mt-4 space-y-1">
                  {navLinks.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
                Logged in as <span className="font-medium text-slate-900">{user.fullName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Footer per Design.md §0 */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        College Placement Management System (CPMS) v1.0
      </footer>
    </div>
  );
};
