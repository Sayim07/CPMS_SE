import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Agentation } from "agentation";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AppShell } from "./components/layout/AppShell";
import { SmoothScrollProvider } from "./components/layout/SmoothScrollProvider";

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

            {/* Authenticated Routes Wrapped in AppShell via Layout Route */}
            <Route element={<AppShell />}>
              {/* Student Routes */}
              <Route path="/student" element={<StudentDashboardPage />} />
              <Route path="/student/jobs" element={<StudentJobsPage />} />
              <Route path="/student/applications" element={<StudentApplicationsPage />} />
              <Route path="/student/profile" element={<StudentProfilePage />} />

              {/* Company Routes */}
              <Route path="/company" element={<CompanyDashboardPage />} />
              <Route path="/company/jobs/new" element={<CreateJobDrivePage />} />
              <Route path="/company/jobs/active" element={<ApplicantKanbanPage />} />
              <Route path="/company/jobs/:id" element={<ApplicantKanbanPage />} />

              {/* TPO Routes */}
              <Route path="/tpo" element={<TpoDashboardPage />} />
              <Route path="/tpo/students" element={<TpoStudentsPage />} />
              <Route path="/tpo/approvals" element={<TpoApprovalsPage />} />
              <Route path="/tpo/companies" element={<TpoApprovalsPage />} />
              <Route path="/tpo/jobs" element={<TpoApprovalsPage />} />
              <Route path="/tpo/reports" element={<TpoReportsPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminUsersPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route path="/admin/audit" element={<AdminAuditPage />} />

              {/* Notifications Center */}
              <Route path="/notifications" element={<NotificationsPage />} />
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
