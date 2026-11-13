import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Agentation } from "agentation";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AppShell } from "./components/layout/AppShell";
import { SmoothScrollProvider } from "./components/layout/SmoothScrollProvider";

// Role-Based Route Guard: Ensures users can only access their authorized portal
interface RoleRouteProps {
  roles: Array<"STUDENT" | "COMPANY" | "TPO" | "ADMIN">;
  children: React.ReactNode;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ roles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="font-mono text-xs font-bold animate-pulse text-zinc-500">
          Loading portal session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    const rolePaths = {
      STUDENT: "/student",
      COMPANY: "/company",
      TPO: "/tpo",
      ADMIN: "/admin/users",
    };
    return <Navigate to={rolePaths[user.role] || "/login"} replace />;
  }

  return <>{children}</>;
};

// Public Pages (Standalone without AppShell)
import { LandingPage } from "./pages/landing/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterStudentPage } from "./pages/auth/RegisterStudentPage";
import { RegisterCompanyPage } from "./pages/auth/RegisterCompanyPage";

// Student Pages
import { StudentDashboardPage } from "./pages/student/StudentDashboardPage";
import { StudentJobsPage } from "./pages/student/StudentJobsPage";
import { StudentApplicationsPage } from "./pages/student/StudentApplicationsPage";
import { StudentProfilePage } from "./pages/student/StudentProfilePage";

// Company Pages
import { CompanyDashboardPage } from "./pages/company/CompanyDashboardPage";
import { CreateJobDrivePage } from "./pages/company/CreateJobDrivePage";
import { ApplicantKanbanPage } from "./pages/company/ApplicantKanbanPage";

// TPO Pages
import { TpoDashboardPage } from "./pages/tpo/TpoDashboardPage";
import { TpoStudentsPage } from "./pages/tpo/TpoStudentsPage";
import { TpoApprovalsPage } from "./pages/tpo/TpoApprovalsPage";
import { TpoReportsPage } from "./pages/tpo/TpoReportsPage";

// Admin Pages
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { AdminAuditPage } from "./pages/admin/AdminAuditPage";

// Notification Center
import { NotificationsPage } from "./pages/notifications/NotificationsPage";

export const App: React.FC = () => {
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isLocal =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.endsWith(".localhost");
      setIsLocalhost(isLocal);
    }
  }, []);

  const showAgentation = import.meta.env.DEV && isLocalhost;

  return (
    <ThemeProvider>
      <SmoothScrollProvider>
        <BrowserRouter>
          <AuthProvider>
          {showAgentation && <Agentation endpoint="http://localhost:4747" />}
          <Routes>
            {/* Public Standalone Landing Page & Auth Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register/student" element={<RegisterStudentPage />} />
            <Route path="/register/company" element={<RegisterCompanyPage />} />

            {/* Authenticated Routes Wrapped in AppShell via Layout Route with Strict Role Isolation */}
            <Route element={<AppShell />}>
              {/* Student Routes - Strictly for STUDENT role */}
              <Route path="/student" element={<RoleRoute roles={["STUDENT"]}><StudentDashboardPage /></RoleRoute>} />
              <Route path="/student/jobs" element={<RoleRoute roles={["STUDENT"]}><StudentJobsPage /></RoleRoute>} />
              <Route path="/student/applications" element={<RoleRoute roles={["STUDENT"]}><StudentApplicationsPage /></RoleRoute>} />
              <Route path="/student/profile" element={<RoleRoute roles={["STUDENT"]}><StudentProfilePage /></RoleRoute>} />

              {/* Company Routes - Strictly for COMPANY role */}
              <Route path="/company" element={<RoleRoute roles={["COMPANY"]}><CompanyDashboardPage /></RoleRoute>} />
              <Route path="/company/jobs/new" element={<RoleRoute roles={["COMPANY"]}><CreateJobDrivePage /></RoleRoute>} />
              <Route path="/company/jobs/active" element={<RoleRoute roles={["COMPANY"]}><ApplicantKanbanPage /></RoleRoute>} />
              <Route path="/company/jobs/:id" element={<RoleRoute roles={["COMPANY"]}><ApplicantKanbanPage /></RoleRoute>} />

              {/* TPO Routes - Strictly for TPO and Super Admin */}
              <Route path="/tpo" element={<RoleRoute roles={["TPO", "ADMIN"]}><TpoDashboardPage /></RoleRoute>} />
              <Route path="/tpo/students" element={<RoleRoute roles={["TPO", "ADMIN"]}><TpoStudentsPage /></RoleRoute>} />
              <Route path="/tpo/approvals" element={<RoleRoute roles={["TPO", "ADMIN"]}><TpoApprovalsPage /></RoleRoute>} />
              <Route path="/tpo/companies" element={<RoleRoute roles={["TPO", "ADMIN"]}><TpoApprovalsPage /></RoleRoute>} />
              <Route path="/tpo/jobs" element={<RoleRoute roles={["TPO", "ADMIN"]}><TpoApprovalsPage /></RoleRoute>} />
              <Route path="/tpo/reports" element={<RoleRoute roles={["TPO", "ADMIN"]}><TpoReportsPage /></RoleRoute>} />

              {/* Admin Routes - Strictly for Super Admin */}
              <Route path="/admin" element={<RoleRoute roles={["ADMIN"]}><AdminUsersPage /></RoleRoute>} />
              <Route path="/admin/users" element={<RoleRoute roles={["ADMIN"]}><AdminUsersPage /></RoleRoute>} />
              <Route path="/admin/settings" element={<RoleRoute roles={["ADMIN"]}><AdminSettingsPage /></RoleRoute>} />
              <Route path="/admin/audit" element={<RoleRoute roles={["ADMIN"]}><AdminAuditPage /></RoleRoute>} />

              {/* Notifications Center - Role-Filtered */}
              <Route path="/notifications" element={<RoleRoute roles={["STUDENT", "COMPANY", "TPO", "ADMIN"]}><NotificationsPage /></RoleRoute>} />
            </Route>

            {/* Fallback Redirection */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </SmoothScrollProvider>
  </ThemeProvider>
  );
};

export default App;
