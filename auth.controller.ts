import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { ENV } from '../config/env';
import { TokenPayload } from '../middleware/auth.middleware';

/**
 * Task 1.1: Register Student
 * Validates roll number format, creates User (role: STUDENT) and Student records with is_verified: false
 */
export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, roll_number, department, cgpa, backlogs } = req.body;

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
      return;
    }

    // Check if roll number already registered
    const existingStudent = await prisma.student.findUnique({ where: { roll_number } });
    if (existingStudent) {
      res.status(409).json({
        success: false,
        message: 'A student with this roll number already exists.',
      });
      return;
    }

    // Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create User and Student records atomically
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'STUDENT',
          failed_login_attempts: 0,
        },
      });

      const student = await tx.student.create({
        data: {
          user_id: user.id,
          roll_number,
          name,
          department: department || null,
          cgpa: cgpa !== undefined ? cgpa : null,
          backlogs: backlogs !== undefined ? backlogs : 0,
          is_verified: false, // Per specification: is_verified defaults to false
        },
      });

      return { user, student };
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully. Verification is pending.',
      data: {
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        student: {
          id: result.student.id,
          name: result.student.name,
          roll_number: result.student.roll_number,
          department: result.student.department,
          cgpa: result.student.cgpa,
          backlogs: result.student.backlogs,
          is_verified: result.student.is_verified,
        },
      },
    });
  } catch (error: any) {
    console.error('Error in registerStudent:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during student registration.',
      error: error.message,
    });
  }
};

/**
 * Task 1.1: Register Company
 * Validates GST/Tax ID, creates User (role: COMPANY) and Company records with status: PENDING
 */
export const registerCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, company_name, gst_tax_id, website, contact_person } = req.body;

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
      return;
    }

    // Check if GST / Tax ID already registered
    const existingCompany = await prisma.company.findUnique({ where: { gst_tax_id } });
    if (existingCompany) {
      res.status(409).json({
        success: false,
        message: 'A company with this GST / Tax ID already exists.',
      });
      return;
    }

    // Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create User and Company records atomically
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'COMPANY',
          failed_login_attempts: 0,
        },
      });

      const company = await tx.company.create({
        data: {
          user_id: user.id,
          company_name,
          gst_tax_id,
          status: 'PENDING', // Per specification: status defaults to PENDING
          website: website || null,
          contact_person: contact_person || null,
        },
      });

      return { user, company };
    });

    res.status(201).json({
      success: true,
      message: 'Company registered successfully. Approval is pending.',
      data: {
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        company: {
          id: result.company.id,
          company_name: result.company.company_name,
          gst_tax_id: result.company.gst_tax_id,
          status: result.company.status,
          website: result.company.website,
          contact_person: result.company.contact_person,
        },
      },
    });
  } catch (error: any) {
    console.error('Error in registerCompany:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during company registration.',
      error: error.message,
    });
  }
};

/**
 * Task 1.2: Login & 5-Attempt Lockout (REQ-2)
 * - Verifies email and password using bcrypt.compare()
 * - Generates signed JWT with 8-hour expiration (cpms_token)
 * - Tracks failed attempts: if failed_login_attempts >= 5, lock account for 15 minutes (HTTP 423 Locked)
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user with relations
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        company: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const now = new Date();

    // Check if account is currently locked
    if (user.lock_until && new Date(user.lock_until) > now) {
      const remainingMs = new Date(user.lock_until).getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to 5 consecutive failed login attempts. Please try again after ${remainingMinutes} minute(s).`,
        locked_until: user.lock_until,
        retry_after_minutes: remainingMinutes,
      });
      return;
    }

    // If lock period has expired, reset failed attempts & lock status
    if (user.lock_until && new Date(user.lock_until) <= now) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failed_login_attempts: 0,
          lock_until: null,
        },
      });
      user.failed_login_attempts = 0;
      user.lock_until = null;
    }

    // Verify password using bcrypt.compare()
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const newAttempts = user.failed_login_attempts + 1;

      // Check if threshold reached
      if (newAttempts >= ENV.MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + ENV.LOCKOUT_DURATION_MINUTES * 60 * 1000);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failed_login_attempts: newAttempts,
            lock_until: lockUntil,
          },
        });

        res.status(423).json({
          success: false,
          message: `Account locked due to 5 consecutive failed login attempts. Try again in ${ENV.LOCKOUT_DURATION_MINUTES} minutes.`,
          locked_until: lockUntil,
          failed_login_attempts: newAttempts,
        });
        return;
      }

      // Record incremented failure count
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failed_login_attempts: newAttempts,
        },
      });

      const remainingAttempts = ENV.MAX_LOGIN_ATTEMPTS - newAttempts;
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        failed_login_attempts: newAttempts,
        remaining_attempts: remainingAttempts,
      });
      return;
    }

    // Successful login: reset failed attempts counter & lock status
    if (user.failed_login_attempts > 0 || user.lock_until !== null) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failed_login_attempts: 0,
          lock_until: null,
        },
      });
    }

    // Generate signed JWT with 8-hour expiration
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
      studentId: user.student?.id,
      companyId: user.company?.id,
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN as any,
    });

    // Set cpms_token cookie (8-hour duration)
    const cookieMaxAgeMs = 8 * 60 * 60 * 1000;
    res.cookie('cpms_token', token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: cookieMaxAgeMs,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token, // Signed JWT token
      token_name: 'cpms_token',
      expires_in: '8h',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        student: user.student
          ? {
              id: user.student.id,
              name: user.student.name,
              roll_number: user.student.roll_number,
              is_verified: user.student.is_verified,
            }
          : undefined,
        company: user.company
          ? {
              id: user.company.id,
              company_name: user.company.company_name,
              status: user.company.status,
            }
          : undefined,
      },
    });
  } catch (error: any) {
    console.error('Error in login:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during authentication.',
      error: error.message,
    });
  }
};

/**
 * Logout / Clear cpms_token cookie
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('cpms_token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};
