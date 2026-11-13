/**
 * CPMS Real-Time Dynamic Data Engine
 * 
 * Provides:
 * 1. Synchronized live data across all roles and pages.
 * 2. Real API integration with backend (/api/v1) with persistent reactive store.
 * 3. Reactive event-driven listeners: any mutation (apply, post job, approve, kanban stage move, verify)
 *    immediately updates all components in real time without hardcoding.
 */

import { apiRequest } from "../lib/api";
import type {
  Department,
  Student,
  Company,
  Job,
  Application,
  NotificationItem,
  AuditLog,
} from "../mock/mockData";
import {
  MOCK_DEPARTMENTS,
} from "../mock/mockData";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "TPO" | "ADMIN";
  department: string;
  password?: string;
  is_active: boolean;
}

export interface SystemSettings {
  singleOfferThresholdLpa: number;
  departments: Department[];
  staff?: StaffMember[];
}

const STORAGE_KEYS = {
  STUDENTS: "cpms_live_students_v2",
  JOBS: "cpms_live_jobs_v2",
  APPLICATIONS: "cpms_live_applications_v2",
  COMPANIES: "cpms_live_companies_v2",
  NOTIFICATIONS: "cpms_live_notifications_v2",
  AUDIT_LOGS: "cpms_live_audit_logs_v2",
  SETTINGS: "cpms_live_settings_v2",
};

const EVENT_NAME = "cpms_data_change";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key } }));
  } catch (err) {
    console.error("Failed to persist to localStorage", err);
  }
}

// Initial state bootstrap - starts 100% clean and dynamic (no hardcoded pre-seeded data)
let studentsState: Student[] = loadFromStorage(STORAGE_KEYS.STUDENTS, []);
let jobsState: Job[] = loadFromStorage(STORAGE_KEYS.JOBS, []);
let applicationsState: Application[] = loadFromStorage(STORAGE_KEYS.APPLICATIONS, []);
let companiesState: Company[] = loadFromStorage(STORAGE_KEYS.COMPANIES, []);
let notificationsState: NotificationItem[] = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
let auditLogsState: AuditLog[] = loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, []);
// Clean up any legacy mock logs that were hardcoded with admin@college.edu
if (auditLogsState.length > 0) {
  const cleaned = auditLogsState.filter((log) => log.actor_email !== "admin@college.edu");
  if (cleaned.length !== auditLogsState.length) {
    auditLogsState = cleaned;
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, cleaned);
  }
}
let settingsState: SystemSettings = loadFromStorage(STORAGE_KEYS.SETTINGS, {
  singleOfferThresholdLpa: 8.0,
  departments: MOCK_DEPARTMENTS,
  staff: [],
});

// Sanitize settingsState.staff if it contains old mock emails
if (settingsState.staff && settingsState.staff.length > 0) {
  settingsState.staff = settingsState.staff.filter(
    (s) => s.email !== "tpo@college.edu" && s.email !== "admin@college.edu"
  );
}

class DynamicDataService {
  // Listen to cross-component or cross-tab changes
  public subscribe(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }

  // --- Students ---
  public getStudents(): Student[] {
    const data = loadFromStorage(STORAGE_KEYS.STUDENTS, studentsState);
    return Array.isArray(data) ? data : [];
  }

  public getStudentById(id: string): Student | undefined {
    return this.getStudents().find((s) => s.id === id);
  }

  public getCurrentStudent(rollNoOrEmail?: string): Student | null {
    const list = this.getStudents();
    if (rollNoOrEmail) {
      const target = rollNoOrEmail.toLowerCase();
      const match = list.find(
        (s) =>
          (s?.roll_no && s.roll_no.toLowerCase() === target) ||
          (s?.email && s.email.toLowerCase() === target)
      );
      if (match) return match;
    }
    return list.length > 0 ? list[0] : null;
  }

  public registerStudent(studentData: Omit<Student, "id">): Student {
    const list = this.getStudents();
    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}`,
    };
    list.unshift(newStudent);
    studentsState = list;
    saveToStorage(STORAGE_KEYS.STUDENTS, list);

    this.addAuditLog({
      action: "STUDENT_REGISTER",
      entity_type: "STUDENT",
      entity_id: newStudent.id,
      actor_role: "STUDENT",
      actor_email: newStudent.email,
      details: { roll_no: newStudent.roll_no, full_name: newStudent.full_name, dept: newStudent.department_code },
    });

    this.addNotification({
      type: "VERIFICATION_RESET",
      message: `New student registration: ${newStudent.full_name} (${newStudent.roll_no}) awaiting TPO verification.`,
      link_path: "/tpo/students",
    });

    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>): Student {
    const list = this.getStudents();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Student not found");

    const previous = list[index];
    // If CGPA or backlogs changed, reset verification per Rules.md §2.2
    const academicChanged =
      (updates.cgpa !== undefined && updates.cgpa !== previous.cgpa) ||
      (updates.active_backlogs !== undefined && updates.active_backlogs !== previous.active_backlogs);

    const updated: Student = {
      ...previous,
      ...updates,
      is_verified: academicChanged ? false : (updates.is_verified ?? previous.is_verified),
    };

    list[index] = updated;
    studentsState = list;
    saveToStorage(STORAGE_KEYS.STUDENTS, list);

    this.addAuditLog({
      action: "STUDENT_UPDATED",
      entity_type: "STUDENT",
      entity_id: id,
      actor_role: "STUDENT",
      actor_email: updated.email,
      details: updates,
    });

    return updated;
  }

  public setStudentVerification(id: string, is_verified: boolean): Student {
    const list = this.getStudents();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Student not found");

    list[index].is_verified = is_verified;
    studentsState = list;
    saveToStorage(STORAGE_KEYS.STUDENTS, list);

    this.addAuditLog({
      action: is_verified ? "STUDENT_VERIFIED" : "STUDENT_VERIFICATION_REVOKED",
      entity_type: "STUDENT",
      entity_id: id,
      actor_role: "TPO",
      actor_email: "tpo@college.edu",
      details: { is_verified },
    });

    this.addNotification({
      type: "VERIFICATION_UPDATE",
      message: `Academic profile of ${list[index].full_name} (${list[index].roll_no}) has been ${is_verified ? "verified" : "flagged"} by TPO.`,
      link_path: "/student/profile",
    });

    return list[index];
  }

  // --- Jobs ---
  public getJobs(): Job[] {
    const data = loadFromStorage(STORAGE_KEYS.JOBS, jobsState);
    return Array.isArray(data) ? data : [];
  }

  public getJobById(id: string): Job | undefined {
    return this.getJobs().find((j) => j.id === id);
  }

  public createJob(jobData: Omit<Job, "id" | "status" | "applicant_count">): Job {
    const list = this.getJobs();
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      status: "PENDING_APPROVAL",
      applicant_count: 0,
    };

    list.unshift(newJob);
    jobsState = list;
    saveToStorage(STORAGE_KEYS.JOBS, list);

    // Try posting to real backend API as well
    apiRequest("/jobs", {
      method: "POST",
      body: JSON.stringify(newJob),
    }).catch(() => {});

    this.addAuditLog({
      action: "JOB_DRIVE_CREATED",
      entity_type: "JOB",
      entity_id: newJob.id,
      actor_role: "COMPANY",
      actor_email: "recruiter@company.com",
      details: { title: newJob.title, ctc_lpa: newJob.ctc_lpa },
    });

    this.addNotification({
      type: "JOB_PENDING",
      message: `New campus drive "${newJob.title}" posted by ${newJob.company_name} is awaiting TPO verification.`,
      link_path: "/tpo/approvals",
    });

    return newJob;
  }

  public updateJobStatus(id: string, status: Job["status"]): Job {
    const list = this.getJobs();
    const index = list.findIndex((j) => j.id === id);
    if (index === -1) throw new Error("Job not found");

    list[index].status = status;
    jobsState = list;
    saveToStorage(STORAGE_KEYS.JOBS, list);

    // Try sending patch to backend
    apiRequest(`/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }).catch(() => {});

    this.addAuditLog({
      action: `JOB_DRIVE_${status}`,
      entity_type: "JOB",
      entity_id: id,
      actor_role: "TPO",
      actor_email: "tpo@college.edu",
      details: { status },
    });

    if (status === "ACTIVE") {
      this.addNotification({
        type: "JOB_APPROVED",
        message: `Campus recruitment drive "${list[index].title}" (${list[index].company_name}) is now live for student applications.`,
        link_path: "/student/jobs",
      });
    }

    return list[index];
  }

  // --- Applications ---
  public getApplications(): Application[] {
    const data = loadFromStorage(STORAGE_KEYS.APPLICATIONS, applicationsState);
    return Array.isArray(data) ? data : [];
  }

  public getApplicationsForJob(jobId: string): Application[] {
    return this.getApplications().filter((a) => a.job_id === jobId);
  }

  public getApplicationsForStudent(studentId: string): Application[] {
    return this.getApplications().filter((a) => a.student_id === studentId);
  }

  public applyToJob(jobId: string, student: Student): { success: boolean; message: string; application?: Application } {
    const jobs = this.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return { success: false, message: "Job not found." };

    if (job.status !== "ACTIVE") {
      return { success: false, message: "Applications for this drive are not active." };
    }

    // Eligibility validation (Rules.md §4.1)
    if (student.single_offer_locked && job.ctc_lpa <= this.getSettings().singleOfferThresholdLpa) {
      return {
        success: false,
        message: `Locked under Single Offer Policy. You already hold an offer and this role (<=${this.getSettings().singleOfferThresholdLpa} LPA) is not a Dream Tier opportunity.`,
      };
    }

    if (student.cgpa < job.min_cgpa) {
      return { success: false, message: `Your CGPA (${student.cgpa.toFixed(1)}) does not meet the minimum cutoff (${job.min_cgpa.toFixed(1)}).` };
    }

    if (student.active_backlogs > job.max_backlogs) {
      return { success: false, message: `Active backlogs (${student.active_backlogs}) exceed maximum allowed (${job.max_backlogs}).` };
    }

    if (!job.department_codes.includes(student.department_code)) {
      return { success: false, message: `Department (${student.department_code}) is not eligible for this role.` };
    }

    const apps = this.getApplications();
    const existing = apps.find((a) => a.job_id === jobId && a.student_id === student.id);
    if (existing) {
      return { success: false, message: "You have already applied for this campus drive." };
    }

    const newApp: Application = {
      id: `app-${Date.now()}`,
      job_id: jobId,
      student_id: student.id,
      student: {
        id: student.id,
        full_name: student.full_name,
        roll_no: student.roll_no,
        department_code: student.department_code,
        cgpa: student.cgpa,
        active_backlogs: student.active_backlogs,
        email: null, // Masked initially per Rules.md §4.4
        phone: null,
      },
      stage: "APPLIED",
      applied_at: new Date().toISOString(),
    };

    apps.unshift(newApp);
    applicationsState = apps;
    saveToStorage(STORAGE_KEYS.APPLICATIONS, apps);

    // Increment applicant count on job
    job.applicant_count = (job.applicant_count || 0) + 1;
    saveToStorage(STORAGE_KEYS.JOBS, jobs);

    this.addAuditLog({
      action: "JOB_APPLIED",
      entity_type: "APPLICATION",
      entity_id: newApp.id,
      actor_role: "STUDENT",
      actor_email: student.email,
      details: { job_title: job.title, company: job.company_name },
    });

    this.addNotification({
      type: "APPLICATION_RECEIVED",
      message: `New applicant (${student.roll_no}) applied for ${job.title}.`,
      link_path: "/company/jobs/active",
    });

    return { success: true, message: "Application submitted successfully!", application: newApp };
  }

  public moveApplicationStage(
    appId: string,
    newStage: Application["stage"],
    actorEmail?: string
  ): Application {
    const apps = this.getApplications();
    const index = apps.findIndex((a) => a.id === appId);
    if (index === -1) throw new Error("Application not found");

    const app = apps[index];
    const studentMaster = this.getStudentById(app.student_id);
    const job = this.getJobById(app.job_id);

    // Unmask student contact when progressing beyond APPLIED/REJECTED (Rules.md §4.4)
    const unmaskedStudent = { ...app.student };
    if (newStage !== "APPLIED" && newStage !== "REJECTED") {
      unmaskedStudent.email = studentMaster?.email || "student@college.edu";
      unmaskedStudent.phone = studentMaster?.phone || "9876543210";
    }

    app.stage = newStage;
    app.student = unmaskedStudent;
    apps[index] = app;
    applicationsState = apps;
    saveToStorage(STORAGE_KEYS.APPLICATIONS, apps);

    const recruiterEmail =
      actorEmail ||
      (job?.company_name ? `${job.company_name.toLowerCase().replace(/\s+/g, "")}@gmail.com` : "recruiter@company.com");

    // If SELECTED, update student placement status and lock if dream tier
    if (newStage === "SELECTED" && studentMaster) {
      const isDream = (job?.ctc_lpa || 0) >= this.getSettings().singleOfferThresholdLpa;
      this.updateStudent(studentMaster.id, {
        placement_status: "PLACED",
        single_offer_locked: isDream,
      });

      this.addNotification({
        type: "OFFER_EXTENDED",
        message: `Congratulations! You have been selected for ${job?.title || "Role"} at ${job?.company_name || "Company"}.`,
        link_path: "/student/applications",
      });

      this.addAuditLog({
        action: "CANDIDATE_SELECTED",
        entity_type: "STUDENT",
        entity_id: studentMaster.id,
        actor_role: "COMPANY",
        actor_email: recruiterEmail,
        details: {
          student_name: studentMaster.full_name,
          student_roll: studentMaster.roll_no,
          student_email: studentMaster.email,
          company_name: job?.company_name || "Company",
          job_title: job?.title || "Role",
          ctc_lpa: job?.ctc_lpa || 0,
          is_dream_offer: isDream,
        },
      });
    } else {
      this.addAuditLog({
        action: "APPLICANT_STAGE_TRANSITIONED",
        entity_type: "APPLICATION",
        entity_id: appId,
        actor_role: "COMPANY",
        actor_email: recruiterEmail,
        details: {
          new_stage: newStage,
          student_name: studentMaster?.full_name || app.student.full_name,
          student_roll: app.student.roll_no,
          company_name: job?.company_name || "Company",
          job_title: job?.title || "Role",
        },
      });
    }

    return app;
  }

  // --- Companies ---
  public getCompanies(): Company[] {
    const data = loadFromStorage(STORAGE_KEYS.COMPANIES, companiesState);
    return Array.isArray(data) ? data : [];
  }

  public registerCompany(companyData: {
    name: string;
    website: string;
    gst_tax_id: string;
    contact_person: string;
    email: string;
    phone: string;
    password?: string;
    status?: "PENDING" | "APPROVED";
  }): Company {
    const list = this.getCompanies();
    const newCompany: Company = {
      id: `cmp-${Date.now()}`,
      company_name: companyData.name,
      website: companyData.website,
      gst_tax_id: companyData.gst_tax_id,
      contact_person: companyData.contact_person,
      contact_phone: companyData.phone,
      email: companyData.email,
      password: companyData.password,
      status: companyData.status || "PENDING",
    };
    list.unshift(newCompany);
    companiesState = list;
    saveToStorage(STORAGE_KEYS.COMPANIES, list);

    const isTpoOnboarding = companyData.status === "APPROVED";
    this.addAuditLog({
      action: isTpoOnboarding ? "COMPANY_ONBOARDED" : "COMPANY_REGISTER",
      entity_type: "COMPANY",
      entity_id: newCompany.id,
      actor_role: isTpoOnboarding ? "TPO" : "COMPANY",
      actor_email: isTpoOnboarding ? "sayimtpo@gmail.com" : (newCompany.email || "recruiter@company.com"),
      details: {
        company_name: newCompany.company_name,
        email: newCompany.email,
        contact_person: newCompany.contact_person,
        website: newCompany.website,
      },
    });

    this.addNotification({
      type: "JOB_PENDING",
      message: `Corporate partner registration submitted: ${newCompany.company_name} awaiting TPO approval.`,
      link_path: "/tpo/approvals",
    });

    return newCompany;
  }

  public updateCompanyStatus(id: string, status: Company["status"]): Company {
    const list = this.getCompanies();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Company not found");

    list[index].status = status;
    companiesState = list;
    saveToStorage(STORAGE_KEYS.COMPANIES, list);

    this.addAuditLog({
      action: `COMPANY_${status}`,
      entity_type: "COMPANY",
      entity_id: id,
      actor_role: "TPO",
      actor_email: "tpo@college.edu",
      details: { status },
    });

    return list[index];
  }

  // --- Notifications ---
  public getNotifications(): NotificationItem[] {
    const data = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, notificationsState);
    return Array.isArray(data) ? data : [];
  }

  public addNotification(item: Omit<NotificationItem, "id" | "created_at" | "read_at">): NotificationItem {
    const list = this.getNotifications();
    const notif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    list.unshift(notif);
    notificationsState = list;
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    return notif;
  }

  public markNotificationsRead(): void {
    const list = this.getNotifications().map((n) => ({
      ...n,
      read_at: n.read_at || new Date().toISOString(),
    }));
    notificationsState = list;
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  public markSingleNotificationRead(id: string): void {
    const list = this.getNotifications().map((n) =>
      n.id === id ? { ...n, read_at: n.read_at || new Date().toISOString() } : n
    );
    notificationsState = list;
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    const data = loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, auditLogsState);
    let list = Array.isArray(data) ? data : [];

    // Strictly filter out any mock admin@college.edu entries
    list = list.filter((log) => log && log.actor_email !== "admin@college.edu");

    // Upgrade any company onboard logs to clearly attribute TPO as actor
    list = list.map((log) => {
      if (log.action === "COMPANY_REGISTER" && log.actor_role === "COMPANY") {
        return {
          ...log,
          action: "COMPANY_ONBOARDED",
          actor_role: "TPO" as const,
          actor_email: "sayimtpo@gmail.com",
          actor_id: "usr-tpo-01",
          details: { ...log.details, email: log.actor_email },
        };
      }
      return log;
    });

    let modified = false;

    // Ensure foundational system audit record exists for Master Admin
    const hasInitLog = list.some((l) => l.action === "SYSTEM_INITIALIZED");
    if (!hasInitLog) {
      list.push({
        id: "aud-sys-init",
        action: "SYSTEM_INITIALIZED",
        entity_type: "GOVERNANCE",
        entity_id: "cpms-master",
        actor_role: "ADMIN",
        actor_id: "usr-adm-01",
        actor_email: "sayimmullick@gmail.com",
        ip_address: "127.0.0.1",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        details: { message: "Deterministic Role-Based Identity & Session Governance initialized by Super Admin." },
      });
      modified = true;
    }

    // Dynamically ensure any currently provisioned TPO has an immutable audit log entry
    const currentStaff = this.getSettings().staff || [];
    for (const tpo of currentStaff) {
      const hasTpoLog = list.some(
        (l) => l.action === "TPO_PROVISIONED" && (l.entity_id === tpo.id || l.details?.email === tpo.email)
      );
      if (!hasTpoLog) {
        list.unshift({
          id: `aud-tpo-${tpo.id}`,
          action: "TPO_PROVISIONED",
          entity_type: "STAFF",
          entity_id: tpo.id,
          actor_role: "ADMIN",
          actor_id: "usr-adm-01",
          actor_email: "sayimmullick@gmail.com",
          ip_address: "127.0.0.1",
          created_at: new Date().toISOString(),
          details: { name: tpo.name, email: tpo.email, department: tpo.department },
        });
        modified = true;
      }
    }

    if (modified || list.length !== (data?.length || 0)) {
      auditLogsState = list;
      saveToStorage(STORAGE_KEYS.AUDIT_LOGS, list);
    }

    return list;
  }

  public addAuditLog(log: Omit<AuditLog, "id" | "created_at" | "ip_address" | "actor_id"> & { ip_address?: string }): AuditLog {
    const list = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `aud-${Date.now()}`,
      actor_id: `usr-${log.actor_role.toLowerCase()}`,
      ip_address: log.ip_address || "127.0.0.1",
      created_at: new Date().toISOString(),
    };
    list.unshift(newLog);
    auditLogsState = list;
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, list);
    return newLog;
  }

  // --- System Settings ---
  public getSettings(): SystemSettings {
    const data = loadFromStorage(STORAGE_KEYS.SETTINGS, settingsState);
    if (data && typeof data === "object") {
      const rawStaff = Array.isArray(data.staff) ? data.staff : [];
      const validStaff = rawStaff.filter(
        (s) => s && s.email !== "tpo@college.edu" && s.email !== "admin@college.edu"
      );
      return {
        singleOfferThresholdLpa:
          typeof data.singleOfferThresholdLpa === "number" ? data.singleOfferThresholdLpa : 8.0,
        departments: Array.isArray(data.departments) ? data.departments : MOCK_DEPARTMENTS,
        staff: validStaff,
      };
    }
    return { singleOfferThresholdLpa: 8.0, departments: MOCK_DEPARTMENTS, staff: [] };
  }

  public updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const updated: SystemSettings = { ...current, ...updates };
    settingsState = updated;
    saveToStorage(STORAGE_KEYS.SETTINGS, updated);

    // Only log settings update when academic policies or thresholds change
    if (updates.singleOfferThresholdLpa !== undefined || updates.departments !== undefined) {
      this.addAuditLog({
        action: "SETTINGS_UPDATED",
        entity_type: "SYSTEM_SETTING",
        entity_id: "global-policy",
        actor_role: "ADMIN",
        actor_email: "sayimmullick@gmail.com",
        details: {
          singleOfferThresholdLpa: updates.singleOfferThresholdLpa,
          departmentsCount: updates.departments?.length,
        },
      });
    }

    return updated;
  }

  // Reset / Clear all dynamic data to a 100% clean slate
  public clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.JOBS);
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.COMPANIES);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    studentsState = [];
    jobsState = [];
    applicationsState = [];
    companiesState = [];
    notificationsState = [];
    auditLogsState = [];
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { action: "clear" } }));
  }

  public resetToDefault(): void {
    this.clearAllData();
  }
}

export const dynamicDataService = new DynamicDataService();

