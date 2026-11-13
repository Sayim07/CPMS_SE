import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
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
  Sun,
  Moon,
  BookOpen,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useDynamicData } from "../../hooks/useDynamicData";
import { cn } from "../../lib/utils";
import { CommandMenu } from "../navigation/CommandMenu";

interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { jobs, applications, students, notifications, currentStudent } = useDynamicData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeJobsCount = (jobs || []).filter((j) => j?.status === "ACTIVE").length;
  const myAppsInReview = (applications || []).filter(
    (a) => a?.student_id === currentStudent?.id && a?.stage !== "SELECTED" && a?.stage !== "REJECTED"
  ).length;
  const pendingStudentsCount = (students || []).filter((s) => !s?.is_verified).length;
  const unreadNotificationsCount = (notifications || []).filter((n) => !n?.read_at).length;

  const getNavLinks = () => {
    switch (user?.role || "STUDENT") {
      case "STUDENT":
        return [
          { name: "Dashboard", path: "/student", icon: <GraduationCap className="w-4 h-4" /> },
          { name: "Job Drives", path: "/student/jobs", icon: <Briefcase className="w-4 h-4" />, badge: `${activeJobsCount} Active` },
          { name: "My Applications", path: "/student/applications", icon: <FileText className="w-4 h-4" />, badge: `${myAppsInReview} In Review` },
          { name: "Profile & Resume", path: "/student/profile", icon: <UserCheck className="w-4 h-4" /> },
        ];
      case "COMPANY":
        return [
          { name: "Overview", path: "/company", icon: <Building2 className="w-4 h-4" /> },
          { name: "Post Drive", path: "/company/jobs/new", icon: <Briefcase className="w-4 h-4" /> },
          { name: "Applicant Pipeline", path: "/company/jobs/active", icon: <Users className="w-4 h-4" />, badge: "Kanban" },
        ];
      case "TPO":
        return [
          { name: "Command Queue", path: "/tpo", icon: <CheckCircle2 className="w-4 h-4" /> },
          { name: "Verify Students", path: "/tpo/students", icon: <Users className="w-4 h-4" />, badge: `${pendingStudentsCount} Pending` },
          { name: "Recruiter Approvals", path: "/tpo/companies", icon: <Building2 className="w-4 h-4" /> },
          { name: "Drive Approvals", path: "/tpo/jobs", icon: <Briefcase className="w-4 h-4" /> },
          { name: "Placement Reports", path: "/tpo/reports", icon: <BarChart3 className="w-4 h-4" /> },
        ];
      case "ADMIN":
        return [
          { name: "User Management", path: "/admin/users", icon: <Users className="w-4 h-4" /> },
          { name: "System Settings", path: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
          { name: "Audit Trail", path: "/admin/audit", icon: <ShieldAlert className="w-4 h-4" /> },
          { name: "Institutional Reports", path: "/tpo/reports", icon: <BarChart3 className="w-4 h-4" /> },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-surface flex flex-col text-on-surface transition-colors duration-200">
      {/* Fixed BrutAdmin Left Sidebar (Desktop) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-[260px] bg-white dark:bg-zinc-900 border-r-2 border-black dark:border-white shadow-[4px_0px_0px_0px_#000] dark:shadow-[4px_0px_0px_0px_#fff] z-50 flex-col justify-between select-none">
        <div className="flex flex-col">
          {/* Brand Crest & Title */}
          <Link
            to="/"
            className="h-16 px-4 flex items-center gap-3 border-b-2 border-black dark:border-white bg-[#FFE600] text-black hover:bg-[#FDE047] transition-colors"
            title="Return to CPMS Landing Page"
          >
            <div className="w-9 h-9 rounded-neo bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-sm tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
              CP
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-headline-sm text-base font-black text-black tracking-tight truncate">
                  CPMS
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-neo bg-black text-white font-black">
                  2024-25
                </span>
              </div>
              <span className="text-[11px] font-bold text-black/80 truncate">
                Placement Command
              </span>
            </div>
          </Link>

          {/* Section: Main Navigation */}
          <div className="px-4 pt-5 pb-1.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-black/60 dark:text-white/60 font-black">
              // Navigation
            </span>
          </div>

          <nav className="flex flex-col px-3 space-y-1.5">
            {navLinks.map((item) => {
              const roleLower = user?.role?.toLowerCase() || "student";
              const isActive =
                location.pathname === item.path ||
                (item.path === "/admin/users" && location.pathname === "/admin") ||
                (item.path === "/tpo/companies" && location.pathname === "/tpo/approvals") ||
                (item.path !== `/${roleLower}` && location.pathname.startsWith(`${item.path}/`));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-neo text-xs font-bold transition-all",
                    isActive
                      ? "bg-[#FFE600] text-black border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] translate-x-[1px]"
                      : "text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 hover:border-2 hover:border-black dark:hover:border-white"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.icon}
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "font-mono text-[10px] px-1.5 py-0.5 rounded-neo font-black border border-black dark:border-white",
                        isActive
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "bg-[#86EFAC] text-black"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Governance & System Telemetry */}
        <div className="flex flex-col border-t-2 border-black dark:border-white pt-3 pb-4 bg-yellow-50/50 dark:bg-zinc-900/80">
          <div className="px-4 pb-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-black/60 dark:text-white/60 font-black">
              // Governance
            </span>
          </div>
          <nav className="flex flex-col px-3 space-y-1">
            <Link
              to="/notifications"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-neo text-xs font-bold text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="truncate">TPO Announcements</span>
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-neo text-xs font-bold text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="truncate">Placement Manual</span>
            </Link>
          </nav>

          {/* Operational Status Sticker */}
          <div className="mt-3 mx-3 px-3 py-2 rounded-neo bg-[#86EFAC] text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-black inline-block animate-pulse"></span>
              <span className="font-mono text-[11px] font-black uppercase tracking-wider">
                System Active
              </span>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-black" />
          </div>
        </div>
      </aside>

      {/* Main Shell Viewport */}
      <div className="md:pl-[260px] flex-1 flex flex-col">
        {/* Fixed Top Administrative Header */}
        <header className="sticky top-0 z-40 h-16 bg-white dark:bg-zinc-900 border-b-2 border-black dark:border-white shadow-[0px_4px_0px_0px_#000] dark:shadow-[0px_4px_0px_0px_#fff] px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-neo border-2 border-black dark:border-white bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000]"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-black dark:text-white">
              <span className="bg-[#FFE600] text-black px-2 py-0.5 rounded-neo border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                CPMS
              </span>
              <span className="font-black text-black dark:text-white">/</span>
              <span className="capitalize font-black text-black dark:text-white">
                {user?.role ? user.role.toLowerCase() : "portal"}
              </span>
              <span className="font-black text-black dark:text-white">/</span>
              <span className="bg-[#7DD3FC] text-black px-2 py-0.5 rounded-neo border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black truncate">
                {location.pathname.split("/")[2] || "Overview"}
              </span>
            </div>

            {/* Quick Command Menu Trigger */}
            <div className="hidden lg:block ml-2">
              <CommandMenu />
            </div>
          </div>

          {/* Right Header Utility Controls */}
          <div className="flex items-center gap-3">
            {/* Authenticated Role Badge */}
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-neo bg-[#7DD3FC] text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] text-xs font-black select-none">
              <span className="font-bold opacity-80">ROLE:</span>
              <span>{user?.role || "GUEST"}</span>
            </span>

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-[#FF70A6] hover:text-black text-xs font-black transition-all cursor-pointer"
              title="Sign Out of Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Notifications Bell */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] text-black dark:text-white transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center font-mono text-[9px] w-4 h-4 rounded-full bg-[#FF70A6] text-black font-black border border-black">
                  {unreadNotificationsCount}
                </span>
              )}
            </Link>

            {/* Dark / Light Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-neo bg-[#FFE600] text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-black" />
              ) : (
                <Sun className="w-4 h-4 text-black" />
              )}
            </button>

            <div className="h-6 w-[2px] bg-black dark:bg-white hidden sm:block"></div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-neo bg-[#A388EE] text-black font-black text-xs flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {user?.fullName ? user.fullName.charAt(0) : "U"}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="font-bold text-xs text-black dark:text-white leading-tight">
                  {user?.fullName}
                </span>
                <span className="font-mono text-[10px] text-black/60 dark:text-white/60 leading-tight">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm">
            <div className="fixed inset-y-0 left-0 w-64 bg-surface-container-lowest p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40">
                  <span className="font-bold text-lg text-primary">CPMS</span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded text-on-surface-variant hover:bg-surface-container-low"
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
                      className="flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-on-surface hover:bg-surface-container-low"
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="pt-4 border-t border-outline-variant/40 text-xs text-on-surface-variant">
                Logged in as <span className="font-medium text-on-surface">{user?.fullName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Routed Content Area */}
        <main className="flex-1 w-full bg-[#F5EEDB] dark:bg-[#141418] neo-grid-pattern p-4 sm:p-6 min-h-[calc(100vh-64px)]">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
