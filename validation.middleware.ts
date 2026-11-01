import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Roll number regex: e.g. 21BCSE001, 2024-CSE-102, alphanumeric with hyphens/underscores, 5-20 chars
export const ROLL_NUMBER_REGEX = /^[A-Za-z0-9\-_]{5,20}$/;

// GSTIN (Indian GST) or standard corporate Tax ID:
// Indian GST format: 15 chars (e.g., 22AAAAA0000A1Z5) or standard corporate tax identifier (8 to 20 alphanumeric)
export const GST_TAX_ID_REGEX = /^([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}|[A-Za-z0-9\-]{8,20})$/i;

export const registerStudentSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  roll_number: z.string().regex(ROLL_NUMBER_REGEX, 'Invalid roll number format (must be 5-20 alphanumeric characters)'),
  department: z.string().optional(),
  cgpa: z.number().min(0).max(10).optional(),
  backlogs: z.number().int().min(0).optional(),
});

export const registerCompanySchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  company_name: z.string().min(2, 'Company name is required'),
  gst_tax_id: z.string().regex(GST_TAX_ID_REGEX, 'Invalid GST / Tax ID format'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  contact_person: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateStudentProfileSchema = z.object({
  name: z.string().min(2).optional(),
  department: z.string().optional(),
  cgpa: z.number().min(0).max(10).optional(),
  backlogs: z.number().int().min(0).optional(),
  resume_url: z.string().url().optional(),
});

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      res.status(400).json({ success: false, message: 'Invalid request payload' });
    }
  };
};
