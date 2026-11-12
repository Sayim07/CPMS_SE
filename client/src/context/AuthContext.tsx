import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest, getStoredToken, setStoredToken } from "../lib/api";

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
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; locked?: boolean }>;
  logout: () => void;
  setRole: (role: Role) => void;
  unreadNotificationsCount: number;
  markNotificationsRead: () => void;
}

export const DEFAULT_USERS: Record<Role, MockUser> = {
  STUDENT: {
    id: "std-001",
    email: "asha.roy@college.edu",
    fullName: "Asha Roy",
    role: "STUDENT",
    rollNo: "21CSE042",
    departmentCode: "CSE",
    isVerified: true,
  },
  COMPANY: {
    id: "cmp-001",
    email: "hr@acmecorp.com",
    fullName: "Ravi Menon",
    role: "COMPANY",
    companyName: "Acme Technologies",
  },
  TPO: {
    id: "tpo-001",
    email: "tpo@college.edu",
    fullName: "Dr. Arvind Sharma",
    role: "TPO",
  },
  ADMIN: {
    id: "adm-001",
    email: "admin@college.edu",
    fullName: "System Administrator",
    role: "ADMIN",
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(() => {
    // Check if previously logged in or default to prototype student
    const savedUser = localStorage.getItem("cpms_user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return DEFAULT_USERS.STUDENT;
      }
    }
    return DEFAULT_USERS.STUDENT;
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

  // Attempt real API login with graceful fallback to prototype
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string; locked?: boolean }> => {
    setIsLoading(true);
    try {
      const res = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.ok && res.data?.token) {
        const u = res.data.user;
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

      if (res.error?.message) {
        setIsLoading(false);
        return { success: false, message: res.error.message };
      }

      // Graceful local fallback if backend is offline
      let fallbackRole: Role = "STUDENT";
      if (email.includes("tpo")) fallbackRole = "TPO";
      else if (email.includes("admin")) fallbackRole = "ADMIN";
      else if (email.includes("company") || email.includes("acme")) fallbackRole = "COMPANY";

      const fallbackUser = DEFAULT_USERS[fallbackRole];
      setUser(fallbackUser);
      setIsLoading(false);
      return { success: true };
    } catch {
      let fallbackRole: Role = "STUDENT";
      if (email.includes("tpo")) fallbackRole = "TPO";
      else if (email.includes("admin")) fallbackRole = "ADMIN";
      else if (email.includes("company") || email.includes("acme")) fallbackRole = "COMPANY";

      setUser(DEFAULT_USERS[fallbackRole]);
      setIsLoading(false);
      return { success: true };
    }
  };

  const logout = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };

  const setRole = (newRole: Role) => {
    const roleUser = DEFAULT_USERS[newRole];
    setUser(roleUser);
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
