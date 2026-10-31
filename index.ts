export type Role = 'STUDENT' | 'COMPANY' | 'TPO' | 'ADMIN';
export const Roles = {
  STUDENT: 'STUDENT' as Role,
  COMPANY: 'COMPANY' as Role,
  TPO: 'TPO' as Role,
  ADMIN: 'ADMIN' as Role,
};

export type CompanyStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export const CompanyStatuses = {
  PENDING: 'PENDING' as CompanyStatus,
  APPROVED: 'APPROVED' as CompanyStatus,
  REJECTED: 'REJECTED' as CompanyStatus,
};
