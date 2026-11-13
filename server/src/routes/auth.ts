import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { Role, CompanyStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { signToken, authenticate } from "../middleware/auth";
import { createAuditLog } from "../services/audit";

export const authRouter = Router();

const ROLL_NUMBER_REGEX = /^[A-Za-z0-9\-_]{5,20}$/;
const GST_TAX_ID_REGEX = /^([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}|[A-Za-z0-9\-]{8,20})$/i;

const registerStudentSchema = z.object({
  email: z.string().email("Invalid email address format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  roll_no: z.string().regex(ROLL_NUMBER_REGEX, "Roll number must be 5-20 alphanumeric characters"),
  department_id: z.string().uuid().optional(),
  department_code: z.string().optional(),
  batch_year: z.coerce.number().int().min(2020).max(2035).default(new Date().getFullYear()),
  cgpa: z.coerce.number().min(0).max(10).default(0.0),
  tenth_pct: z.coerce.number().min(0).max(100).default(0.0),
  twelfth_pct: z.coerce.number().min(0).max(100).default(0.0),
  phone: z.string().min(7).max(20).default("0000000000"),
  active_backlogs: z.coerce.number().int().min(0).default(0),
});

const registerCompanySchema = z.object({
  email: z.string().email("Invalid email address format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  company_name: z.string().min(2, "Company name is required"),
  gst_tax_id: z.string().regex(GST_TAX_ID_REGEX, "Invalid GST / Corporate Tax ID format"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  contact_phone: z.string().min(7).max(20).default("0000000000"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address format"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/v1/auth/register/student
authRouter.post("/register/student", async (req: Request, res: Response) => {
  const parseResult = registerStudentSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid student registration fields.",
        details: parseResult.error.errors,
      },
    });
  }

  const data = parseResult.data;

  // Check existing user or student
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    return res.status(409).json({
      error: { code: "EMAIL_EXISTS", message: "A user with this email address already exists." },
    });
  }

  const existingStudent = await prisma.student.findUnique({ where: { roll_no: data.roll_no } });
  if (existingStudent) {
    return res.status(409).json({
      error: { code: "ROLL_EXISTS", message: "A student with this roll number already exists." },
    });
  }

  // Resolve department
  let departmentId = data.department_id;
  if (!departmentId && data.department_code) {
    const dept = await prisma.department.findUnique({ where: { code: data.department_code } });
    if (dept) departmentId = dept.id;
  }
  if (!departmentId) {
    const firstDept = await prisma.department.findFirst({ where: { is_active: true } });
    if (firstDept) departmentId = firstDept.id;
    else {
      // Create fallback department if none exist
      const newDept = await prisma.department.create({
        data: { code: "CSE", name: "Computer Science & Engineering" },
      });
      departmentId = newDept.id;
    }
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        password_hash: passwordHash,
        role: Role.STUDENT,
        full_name: data.full_name,
        failed_login_count: 0,
      },
    });

    const student = await tx.student.create({
      data: {
        user_id: user.id,
        roll_no: data.roll_no,
        department_id: departmentId!,
        batch_year: data.batch_year,
        cgpa: data.cgpa,
        tenth_pct: data.tenth_pct,
        twelfth_pct: data.twelfth_pct,
        phone: data.phone,
        active_backlogs: data.active_backlogs,
        is_verified: false,
      },
    });

    return { user, student };
  });

  await createAuditLog({
    actorUserId: result.user.id,
    action: "USER_CREATED",
    entityType: "student",
    entityId: result.student.id,
    metadata: { roll_no: data.roll_no },
  });

  const token = signToken({
    sub: result.user.id,
    email: result.user.email,
    role: result.user.role,
    full_name: result.user.full_name,
    student_id: result.student.id,
  });

  res.status(201).json({
    message: "Student account registered successfully. Verification is pending TPO review.",
    token,
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      full_name: result.user.full_name,
      student_id: result.student.id,
      is_verified: result.student.is_verified,
    },
  });
});

// POST /api/v1/auth/register/company
authRouter.post("/register/company", async (req: Request, res: Response) => {
  const parseResult = registerCompanySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid company registration fields.",
        details: parseResult.error.errors,
      },
    });
  }

  const data = parseResult.data;

  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    return res.status(409).json({
      error: { code: "EMAIL_EXISTS", message: "A user with this email address already exists." },
    });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        password_hash: passwordHash,
        role: Role.COMPANY,
        full_name: data.company_name,
        failed_login_count: 0,
      },
    });

    const company = await tx.company.create({
      data: {
        user_id: user.id,
        company_name: data.company_name,
        website: data.website || "",
        gst_tax_id: data.gst_tax_id,
        contact_phone: data.contact_phone,
        status: CompanyStatus.PENDING,
      },
    });

    return { user, company };
  });

  await createAuditLog({
    actorUserId: result.user.id,
    action: "USER_CREATED",
    entityType: "company",
    entityId: result.company.id,
    metadata: { company_name: data.company_name },
  });

  const token = signToken({
    sub: result.user.id,
    email: result.user.email,
    role: result.user.role,
    full_name: result.user.full_name,
    company_id: result.company.id,
  });

  res.status(201).json({
    message: "Company account registered. TPO approval required before posting drives.",
    token,
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      full_name: result.user.full_name,
      company_id: result.company.id,
      status: result.company.status,
    },
  });
});

// POST /api/v1/auth/login (REQ-2: 5 failed attempts = 15-minute lockout HTTP 423)
authRouter.post("/login", async (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Email and password are required." },
    });
  }

  const { email, password } = parseResult.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      student: true,
      company: true,
    },
  });

  if (!user || !user.is_active) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Invalid email or password." },
    });
  }

  const now = new Date();

  // Check Account Lockout
  if (user.locked_until && user.locked_until > now) {
    const minutesLeft = Math.ceil((user.locked_until.getTime() - now.getTime()) / 60000);
    return res.status(423).json({
      error: {
        code: "ACCOUNT_LOCKED",
        message: `Account is temporarily locked due to consecutive failed attempts (REQ-2). Try again in ${minutesLeft} minute(s).`,
        locked_until: user.locked_until,
      },
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    const nextFailedCount = user.failed_login_count + 1;
    let lockedUntil: Date | null = null;

    if (nextFailedCount >= 5) {
      lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failed_login_count: nextFailedCount,
          locked_until: lockedUntil,
        },
      });

      return res.status(423).json({
        error: {
          code: "ACCOUNT_LOCKED",
          message: "Account temporarily locked for 15 minutes due to 5 consecutive failed login attempts (REQ-2).",
          locked_until: lockedUntil,
        },
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failed_login_count: nextFailedCount },
    });

    return res.status(401).json({
      error: {
        code: "INVALID_CREDENTIALS",
        message: `Invalid email or password. Attempt ${nextFailedCount} of 5 before 15-minute lockout.`,
        failed_attempts: nextFailedCount,
      },
    });
  }

  // Login successful: reset failed count and unlock
  if (user.failed_login_count > 0 || user.locked_until) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failed_login_count: 0, locked_until: null },
    });
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    student_id: user.student?.id,
    company_id: user.company?.id,
  });

  res.status(200).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      student_id: user.student?.id,
      company_id: user.company?.id,
      is_verified: user.student?.is_verified,
      company_status: user.company?.status,
    },
  });
});

// GET /api/v1/auth/me
authRouter.get("/me", authenticate, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      role: true,
      full_name: true,
      student: {
        include: { department: true },
      },
      company: true,
      created_at: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "User not found." },
    });
  }

  res.status(200).json({ data: user });
});

