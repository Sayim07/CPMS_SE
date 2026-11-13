import { useState, useEffect } from "react";
import { dynamicDataService } from "../services/dataService";
import { useAuth } from "../context/AuthContext";
import type { Student } from "../mock/mockData";

export function useDynamicData() {
  const { user } = useAuth();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = dynamicDataService.subscribe(() => {
      setVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  const students = dynamicDataService.getStudents();
  const jobs = dynamicDataService.getJobs();
  const applications = dynamicDataService.getApplications();
  const companies = dynamicDataService.getCompanies();
  const notifications = dynamicDataService.getNotifications(user?.role, user?.email);
  const auditLogs = dynamicDataService.getAuditLogs();
  const settings = dynamicDataService.getSettings();

  const currentStudent = dynamicDataService.getCurrentStudent(user?.rollNo || user?.email);

  return {
    version,
    students,
    jobs,
    applications,
    companies,
    notifications,
    auditLogs,
    settings,
    currentStudent,
    // Operations
    applyToJob: (jobId: string, student?: Student | null) => {
      const targetStudent = student || currentStudent;
      if (!targetStudent) {
        return { success: false, message: "Please register your student profile first before applying to placement drives." };
      }
      return dynamicDataService.applyToJob(jobId, targetStudent);
    },
    registerStudent: dynamicDataService.registerStudent.bind(dynamicDataService),
    registerCompany: dynamicDataService.registerCompany.bind(dynamicDataService),
    createJob: dynamicDataService.createJob.bind(dynamicDataService),
    updateJobStatus: dynamicDataService.updateJobStatus.bind(dynamicDataService),
    moveApplicationStage: dynamicDataService.moveApplicationStage.bind(dynamicDataService),
    updateStudent: dynamicDataService.updateStudent.bind(dynamicDataService),
    setStudentVerification: dynamicDataService.setStudentVerification.bind(dynamicDataService),
    updateCompanyStatus: dynamicDataService.updateCompanyStatus.bind(dynamicDataService),
    updateSettings: dynamicDataService.updateSettings.bind(dynamicDataService),
    markNotificationsRead: dynamicDataService.markNotificationsRead.bind(dynamicDataService),
    markSingleNotificationRead: dynamicDataService.markSingleNotificationRead.bind(dynamicDataService),
    clearAllData: dynamicDataService.clearAllData.bind(dynamicDataService),
    resetToDefault: dynamicDataService.resetToDefault.bind(dynamicDataService),
  };
}

