import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest, getStoredToken, setStoredToken } from "../lib/api";
import { dynamicDataService } from "../services/dataService";

export type Role = "STUDENT" | "COMPANY" | "TPO" | "ADMIN";

export interface MockUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  rollNo?: string;
  departmentCode?: string;
  companyName?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (
    email: string,
    password: string,
    selectedRole?: Role
  ) => Promise<{ success: boolean; message?: string; locked?: boolean }>;
  logout: () => void;
  setRole: (role: Role) => void;
  setUser: (user: MockUser | null) => void;
  unreadNotificationsCount: number;
  markNotificationsRead: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(() => {
    const savedUser = localStorage.getItem("cpms_user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    const students = dynamicDataService.getStudents();
    if (students.length > 0) {
      const s = students[0];
      return {
        id: s.id,
        email: s.email,
        fullName: s.full_name,
        role: "STUDENT",
        rollNo: s.roll_no,
        departmentCode: s.department_code,
        isVerified: s.is_verified,
      };
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(3);

  // Sync user state changes with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("cpms_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("cpms_user");
    }
  }, [user]);

  // Real Dynamic Login Engine
  const login = async (
    email: string,
    password: string,
    selectedRole?: Role
  ): Promise<{ success: boolean; message?: string; locked?: boolean }> => {
    setIsLoading(true);
    try {
      const res = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.ok && res.data?.token) {
        const u = res.data.user;
        if (selectedRole && u.role !== selectedRole) {
          setIsLoading(false);
          return {
            success: false,
            message: `Account role mismatch: This account is registered as ${u.role}, but you selected ${selectedRole}.`,
          };
        }
        const mappedUser: MockUser = {
          id: u.id,
          email: u.email,
          fullName: u.full_name || u.fullName || "User",
          role: u.role,
          rollNo: u.roll_no || u.rollNo,
          isVerified: u.is_verified ?? true,
          companyName: u.company_name,
        };

        setStoredToken(res.data.token);
        setToken(res.data.token);
        setUser(mappedUser);
        setIsLoading(false);
        return { success: true };
      }

      // Check HTTP 423 Account Lockout
      if (res.status === 423) {
        setIsLoading(false);
        return {
          success: false,
          locked: true,
          message: res.error?.message || "Account temporarily locked for 15 minutes (REQ-2).",
        };
      }

      // Dynamic local lookup from registered real-time stores
      const target = email.trim().toLowerCase();

      // 1. Role = STUDENT
      if (selectedRole === "STUDENT") {
        const registeredStudents = dynamicDataService.getStudents();
        const matchedStudent = registeredStudents.find(
          (s) =>
            (s.email && s.email.toLowerCase() === target) ||
            (s.roll_no && s.roll_no.toLowerCase() === target)
        );
        if (!matchedStudent) {
          setIsLoading(false);
          return {
            success: false,
            message: "No registered student found with this email or roll number. Please complete student registration first.",
          };
        }
        const expectedPassword = matchedStudent.password || "Passw0rd!x";
        if (password.trim() !== expectedPassword && password.trim().length < 4) {
          setIsLoading(false);
          return {
            success: false,
            message: "Incorrect password for this student account.",
          };
        }
        const studentUser: MockUser = {
          id: matchedStudent.id,
          email: matchedStudent.email,
          fullName: matchedStudent.full_name,
          role: "STUDENT",
          rollNo: matchedStudent.roll_no,
          departmentCode: matchedStudent.department_code,
          isVerified: matchedStudent.is_verified,
        };
        setUser(studentUser);
        dynamicDataService.addAuditLog({
          action: "STUDENT_LOGIN",
          entity_type: "SESSION",
          entity_id: matchedStudent.id,
          actor_role: "STUDENT",
          actor_email: matchedStudent.email,
          details: { full_name: matchedStudent.full_name, roll_no: matchedStudent.roll_no },
        });
        setIsLoading(false);
        return { success: true };
      }

      // 2. Role = COMPANY (Onboarded by TPO)
      if (selectedRole === "COMPANY") {
        const registeredCompanies = dynamicDataService.getCompanies();
        const matchedCompany = registeredCompanies.find(
          (c) =>
            (c.email && c.email.toLowerCase() === target) ||
            (c.company_name && c.company_name.toLowerCase() === target)
        );
        if (!matchedCompany) {
          setIsLoading(false);
          return {
            success: false,
            message: "No registered company found with this email. Please contact the Placement Cell (TPO) to register.",
          };
        }

        const expectedPassword = matchedCompany.password || "Passw0rd!x";
        if (password.trim() !== expectedPassword) {
          setIsLoading(false);
          return {
            success: false,
            message: "Incorrect password for this company account.",
          };
        }

        const companyUser: MockUser = {
          id: matchedCompany.id,
          email: matchedCompany.email || "recruiter@company.com",
          fullName: matchedCompany.contact_person || matchedCompany.company_name,
          role: "COMPANY",
          companyName: matchedCompany.company_name,
        };
        setUser(companyUser);
        dynamicDataService.addAuditLog({
          action: "RECRUITER_LOGIN",
          entity_type: "SESSION",
          entity_id: matchedCompany.id,
          actor_role: "COMPANY",
          actor_email: matchedCompany.email || target,
          details: { company_name: matchedCompany.company_name, contact_person: matchedCompany.contact_person },
        });
        setIsLoading(false);
        return { success: true };
      }

      // 3. Role = TPO (Provisioned by Super Admin)
      if (selectedRole === "TPO") {
        const staffList = dynamicDataService.getSettings().staff || [];
        const matchedStaff = staffList.find(
          (s) =>
            s.role === "TPO" &&
            s.is_active &&
            s.email.toLowerCase() === target
        );

        if (!matchedStaff) {
          setIsLoading(false);
          return {
            success: false,
            message: "No active TPO account found with this email. Please contact the Administrator.",
          };
        }

        const expectedPassword = matchedStaff.password || "Passw0rd!x";
        if (password.trim() !== expectedPassword) {
          setIsLoading(false);
          return {
            success: false,
            message: "Incorrect password for this TPO Officer account.",
          };
        }

        const tpoUser: MockUser = {
          id: matchedStaff.id,
          email: matchedStaff.email,
          fullName: matchedStaff.name,
          role: "TPO",
        };
        setUser(tpoUser);
        dynamicDataService.addAuditLog({
          action: "TPO_LOGIN",
          entity_type: "SESSION",
          entity_id: matchedStaff.id,
          actor_role: "TPO",
          actor_email: matchedStaff.email,
          details: { name: matchedStaff.name, role: "TPO" },
        });
        setIsLoading(false);
        return { success: true };
      }

      // 4. Role = ADMIN (Strictly Super Admin Credentials Only)
      if (selectedRole === "ADMIN") {
        const isMasterAdminEmail =
          target === "sayimmullick@gmail.com" ||
          target === "sayimmullick2006@gmail.com";

        if (!isMasterAdminEmail) {
          setIsLoading(false);
          return {
            success: false,
            message: "Invalid email for Admin access.",
          };
        }

        const isCorrectPassword = password.trim() === "sayim007s";

        if (!isCorrectPassword) {
          setIsLoading(false);
          return {
            success: false,
            message: "Incorrect password for Admin account.",
          };
        }

        const adminUser: MockUser = {
          id: "usr-adm-01",
          email: target,
          fullName: "Sayim Mullick (Super Admin)",
          role: "ADMIN",
        };
        setUser(adminUser);
        dynamicDataService.addAuditLog({
          action: "ADMIN_LOGIN",
          entity_type: "SESSION",
          entity_id: "usr-adm-01",
          actor_role: "ADMIN",
          actor_email: target,
          details: { identity: "Sayim Mullick (Super Admin)" },
        });
        setIsLoading(false);
        return { success: true };
      }

      // Fallback if no specific role was selected (detect by email)
      const registeredStudents = dynamicDataService.getStudents();
      const matchedStudent = registeredStudents.find(
        (s) => s.email.toLowerCase() === target || s.roll_no.toLowerCase() === target
      );
      if (matchedStudent) {
        setUser({
          id: matchedStudent.id,
          email: matchedStudent.email,
          fullName: matchedStudent.full_name,
          role: "STUDENT",
          rollNo: matchedStudent.roll_no,
          departmentCode: matchedStudent.department_code,
          isVerified: matchedStudent.is_verified,
        });
        setIsLoading(false);
        return { success: true };
      }

      const registeredCompanies = dynamicDataService.getCompanies();
      const matchedCompany = registeredCompanies.find(
        (c) =>
          (c.email && c.email.toLowerCase() === target) ||
          c.company_name.toLowerCase() === target
      );
      if (matchedCompany) {
        setUser({
          id: matchedCompany.id,
          email: matchedCompany.email || "recruiter@company.com",
          fullName: matchedCompany.contact_person || matchedCompany.company_name,
          role: "COMPANY",
          companyName: matchedCompany.company_name,
        });
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return {
        success: false,
        message: "No registered account found. Please check your credentials or register first.",
      };
    } catch {
      setIsLoading(false);
      return {
        success: false,
        message: "Login failed. Please verify credentials or register.",
      };
    }
  };

  const logout = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem("cpms_user");
  };

  const setRole = (newRole: Role) => {
    if (newRole === "TPO") {
      setUser({
        id: "usr-tpo-01",
        email: "tpo@college.edu",
        fullName: "Dr. Arvind Sharma",
        role: "TPO",
      });
    } else if (newRole === "ADMIN") {
      setUser({
        id: "usr-adm-01",
        email: "sayimmullick@gmail.com",
        fullName: "Sayim Mullick (Super Admin)",
        role: "ADMIN",
      });
    } else if (newRole === "STUDENT") {
      const students = dynamicDataService.getStudents();
      if (students.length > 0) {
        const s = students[0];
        setUser({
          id: s.id,
          email: s.email,
          fullName: s.full_name,
          role: "STUDENT",
          rollNo: s.roll_no,
          departmentCode: s.department_code,
          isVerified: s.is_verified,
        });
      } else {
        setUser({
          id: "std-pending",
          email: "",
          fullName: "Candidate",
          role: "STUDENT",
          rollNo: "",
          isVerified: false,
        });
      }
    } else if (newRole === "COMPANY") {
      const companies = dynamicDataService.getCompanies();
      if (companies.length > 0) {
        const c = companies[0];
        setUser({
          id: c.id,
          email: c.email || "recruiter@company.com",
          fullName: c.contact_person || c.company_name,
          companyName: c.company_name,
          role: "COMPANY",
        });
      } else {
        setUser({
          id: "cmp-pending",
          email: "",
          fullName: "Recruiter",
          companyName: "Corporate Partner",
          role: "COMPANY",
        });
      }
    }
  };

  const markNotificationsRead = () => {
    setUnreadNotificationsCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        token,
        login,
        logout,
        setRole,
        setUser,
        unreadNotificationsCount,
        markNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
