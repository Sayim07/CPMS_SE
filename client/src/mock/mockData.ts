/**
 * Typed Mock Data Store conforming strictly to Schema.md §3 & §5 contracts.
 * Used for the frontend-first interactive UI prototype.
 */

export interface Department {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
}

export interface Student {
  id: string;
  roll_no: string;
  full_name: string;
  email: string;
  phone: string;
  department_code: string;
  department_id: string;
  batch_year: number;
  cgpa: number;
  tenth_pct: number;
  twelfth_pct: number;
  active_backlogs: number;
  has_resume: boolean;
  resume_uploaded_at?: string;
  is_verified: boolean;
  placement_status: "PLACED" | "UNPLACED";
  single_offer_locked: boolean;
}

export interface Company {
  id: string;
  company_name: string;
  website: string;
  gst_tax_id: string;
  contact_person: string;
  contact_phone: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface Job {
  id: string;
  title: string;
  company_name: string;
  company_id: string;
  description: string;
  ctc_lpa: number;
  min_cgpa: number;
  max_backlogs: number;
  department_codes: string[];
  application_deadline: string;
  status: "PENDING_APPROVAL" | "ACTIVE" | "CLOSED" | "REJECTED";
  applicant_count: number;
}

export interface Application {
  id: string;
  job_id: string;
  student_id: string;
  student: {
    id: string;
    full_name: string;
    roll_no: string;
    department_code: string;
    cgpa: number;
    active_backlogs: number;
    email: string | null; // Masked if APPLIED or REJECTED
    phone: string | null;
  };
  stage: "APPLIED" | "SHORTLISTED" | "IN_INTERVIEW" | "SELECTED" | "REJECTED";
  applied_at: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  link_path: string;
  read_at: string | null;
  created_at: string;
}

export const MOCK_DEPARTMENTS: Department[] = [
  { id: "dept-1", code: "CSE", name: "Computer Science & Engineering", is_active: true },
  { id: "dept-2", code: "ECE", name: "Electronics & Communication Engineering", is_active: true },
  { id: "dept-3", code: "MECH", name: "Mechanical Engineering", is_active: true },
  { id: "dept-4", code: "IT", name: "Information Technology", is_active: true },
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: "std-001",
    roll_no: "21CSE042",
    full_name: "Asha Roy",
    email: "asha.roy@college.edu",
    phone: "9876543210",
    department_code: "CSE",
    department_id: "dept-1",
    batch_year: 2026,
    cgpa: 8.12,
    tenth_pct: 91.5,
    twelfth_pct: 88.0,
    active_backlogs: 0,
    has_resume: true,
    resume_uploaded_at: "2026-10-01T08:00:00Z",
    is_verified: true,
    placement_status: "UNPLACED",
    single_offer_locked: false,
  },
  {
    id: "std-002",
    roll_no: "21ECE015",
    full_name: "Rahul Verma",
    email: "rahul.verma@college.edu",
    phone: "9876543211",
    department_code: "ECE",
    department_id: "dept-2",
    batch_year: 2026,
    cgpa: 6.8,
    tenth_pct: 85.0,
    twelfth_pct: 82.0,
    active_backlogs: 1,
    has_resume: true,
    resume_uploaded_at: "2026-10-03T11:20:00Z",
    is_verified: true,
    placement_status: "UNPLACED",
    single_offer_locked: false,
  },
  {
    id: "std-003",
    roll_no: "21CSE088",
    full_name: "Sneha Nair",
    email: "sneha.nair@college.edu",
    phone: "9876543212",
    department_code: "CSE",
    department_id: "dept-1",
    batch_year: 2026,
    cgpa: 9.4,
    tenth_pct: 95.0,
    twelfth_pct: 93.5,
    active_backlogs: 0,
    has_resume: true,
    resume_uploaded_at: "2026-09-28T14:15:00Z",
    is_verified: true,
    placement_status: "PLACED",
    single_offer_locked: true,
  },
  {
    id: "std-004",
    roll_no: "21MECH031",
    full_name: "Amit Patel",
    email: "amit.patel@college.edu",
    phone: "9876543213",
    department_code: "MECH",
    department_id: "dept-3",
    batch_year: 2026,
    cgpa: 7.2,
    tenth_pct: 88.0,
    twelfth_pct: 79.5,
    active_backlogs: 0,
    has_resume: false,
    is_verified: false,
    placement_status: "UNPLACED",
    single_offer_locked: false,
  },
  {
    id: "std-005",
    roll_no: "21IT024",
    full_name: "Rohan Gupta",
    email: "rohan.gupta@college.edu",
    phone: "9876543214",
    department_code: "IT",
    department_id: "dept-4",
    batch_year: 2026,
    cgpa: 7.6,
    tenth_pct: 89.0,
    twelfth_pct: 86.0,
    active_backlogs: 0,
    has_resume: true,
    resume_uploaded_at: "2026-10-02T10:00:00Z",
    is_verified: true,
    placement_status: "UNPLACED",
    single_offer_locked: false,
  },
];

export const MOCK_COMPANIES: Company[] = [
  {
    id: "cmp-001",
    company_name: "Acme Technologies",
    website: "https://acme.example.com",
    gst_tax_id: "22AAAAA0000A1Z5",
    contact_person: "Ravi Menon",
    contact_phone: "9000000000",
    status: "APPROVED",
  },
  {
    id: "cmp-002",
    company_name: "CloudScale Software",
    website: "https://cloudscale.example.com",
    gst_tax_id: "29BBBBB1111B2Z6",
    contact_person: "Priya Sundaram",
    contact_phone: "9111111111",
    status: "APPROVED",
  },
  {
    id: "cmp-003",
    company_name: "Apex Dynamics",
    website: "https://apexdynamics.example.com",
    gst_tax_id: "33CCCCC2222C3Z7",
    contact_person: "Karthik Raja",
    contact_phone: "9222222222",
    status: "PENDING",
  },
];

export const MOCK_JOBS: Job[] = [
  {
    id: "job-101",
    title: "Software Development Engineer",
    company_name: "Acme Technologies",
    company_id: "cmp-001",
    description: "Backend microservices and systems design using TypeScript and PostgreSQL. Responsible for high-scale API development and data integrity.",
    ctc_lpa: 12.5,
    min_cgpa: 7.5,
    max_backlogs: 0,
    department_codes: ["CSE", "IT"],
    application_deadline: "2026-11-15T18:30:00Z",
    status: "ACTIVE",
    applicant_count: 24,
  },
  {
    id: "job-102",
    title: "Frontend Engineer (React)",
    company_name: "CloudScale Software",
    company_id: "cmp-002",
    description: "Modern enterprise web interfaces with high responsiveness, design systems, and client-side performance tuning.",
    ctc_lpa: 8.0,
    min_cgpa: 6.5,
    max_backlogs: 1,
    department_codes: ["CSE", "ECE", "IT"],
    application_deadline: "2026-11-20T18:30:00Z",
    status: "ACTIVE",
    applicant_count: 18,
  },
  {
    id: "job-103",
    title: "Firmware / Embedded Systems Engineer",
    company_name: "Apex Dynamics",
    company_id: "cmp-003",
    description: "Low-level C/C++ firmware development for embedded IoT controllers and automotive subsystems.",
    ctc_lpa: 7.0,
    min_cgpa: 7.0,
    max_backlogs: 0,
    department_codes: ["ECE", "MECH"],
    application_deadline: "2026-11-25T18:30:00Z",
    status: "PENDING_APPROVAL",
    applicant_count: 0,
  },
  {
    id: "job-104",
    title: "Cloud Infrastructure Associate",
    company_name: "Acme Technologies",
    company_id: "cmp-001",
    description: "DevOps automation, Terraform scripts, and Linux systems administration.",
    ctc_lpa: 6.5,
    min_cgpa: 6.0,
    max_backlogs: 0,
    department_codes: ["CSE", "ECE", "IT", "MECH"],
    application_deadline: "2026-10-01T18:30:00Z",
    status: "CLOSED",
    applicant_count: 35,
  },
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: "app-201",
    job_id: "job-101",
    student_id: "std-001",
    student: {
      id: "std-001",
      full_name: "Asha Roy",
      roll_no: "21CSE042",
      department_code: "CSE",
      cgpa: 8.12,
      active_backlogs: 0,
      email: "asha.roy@college.edu",
      phone: "9876543210",
    },
    stage: "SHORTLISTED",
    applied_at: "2026-10-05T09:30:00Z",
  },
  {
    id: "app-202",
    job_id: "job-101",
    student_id: "std-005",
    student: {
      id: "std-005",
      full_name: "Rohan Gupta",
      roll_no: "21IT024",
      department_code: "IT",
      cgpa: 7.6,
      active_backlogs: 0,
      email: null, // Masked per Rules.md §4.4
      phone: null,
    },
    stage: "APPLIED",
    applied_at: "2026-10-06T14:20:00Z",
  },
  {
    id: "app-203",
    job_id: "job-101",
    student_id: "std-003",
    student: {
      id: "std-003",
      full_name: "Sneha Nair",
      roll_no: "21CSE088",
      department_code: "CSE",
      cgpa: 9.4,
      active_backlogs: 0,
      email: "sneha.nair@college.edu",
      phone: "9876543212",
    },
    stage: "SELECTED",
    applied_at: "2026-10-04T11:00:00Z",
  },
  {
    id: "app-204",
    job_id: "job-101",
    student_id: "std-002",
    student: {
      id: "std-002",
      full_name: "Rahul Verma",
      roll_no: "21ECE015",
      department_code: "ECE",
      cgpa: 6.8,
      active_backlogs: 1,
      email: "rahul.verma@college.edu",
      phone: "9876543211",
    },
    stage: "IN_INTERVIEW",
    applied_at: "2026-10-05T16:45:00Z",
  },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "ROUND_SCHEDULED",
    message: "Technical Interview Round 1 scheduled for Software Development Engineer (Acme Technologies).",
    link_path: "/student/applications",
    read_at: null,
    created_at: "2026-10-09T10:00:00Z",
  },
  {
    id: "notif-2",
    type: "JOB_PENDING",
    message: "New job drive 'Firmware Engineer' posted by Apex Dynamics is awaiting TPO approval.",
    link_path: "/tpo/jobs",
    read_at: null,
    created_at: "2026-10-08T15:30:00Z",
  },
  {
    id: "notif-3",
    type: "VERIFICATION_RESET",
    message: "Your profile has been verified by TPO Dr. Arvind Sharma.",
    link_path: "/student/profile",
    read_at: null,
    created_at: "2026-10-07T09:00:00Z",
  },
];
