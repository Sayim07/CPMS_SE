import React, { createContext, useContext, useState } from "react";

export type Role = "STUDENT" | "COMPANY" | "TPO" | "ADMIN";

export interface MockUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  // Role specific details
  rollNo?: string;
  departmentCode?: string;
  companyName?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: MockUser;
  setRole: (role: Role) => void;
  unreadNotificationsCount: number;
  markNotificationsRead: () => void;
}

const DEFAULT_USERS: Record<Role, MockUser> = {
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
  const [user, setUser] = useState<MockUser>(DEFAULT_USERS.STUDENT);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(3);

  const setRole = (newRole: Role) => {
    setUser(DEFAULT_USERS[newRole]);
  };

  const markNotificationsRead = () => {
    setUnreadNotificationsCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
