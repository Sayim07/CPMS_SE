import { Router } from 'express';
import {
  getMyStudentProfile,
  updateMyStudentProfile,
  getResumePresignedUrl,
} from '../controllers/student.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validateBody, updateStudentProfileSchema } from '../middleware/validation.middleware';
import prisma from '../config/prisma';

const router = Router();

// Task 2.1: Student profile CRUD - GET /students/me
router.get('/me', authenticate, requireRole(['STUDENT']), getMyStudentProfile);

// Task 2.1 & 2.4: Student profile update with verification reset on edit (REQ-5)
router.put(
  '/me',
  authenticate,
  requireRole(['STUDENT']),
  validateBody(updateStudentProfileSchema),
  updateMyStudentProfile
);

// Task 2.2 & 2.3: Pre-signed upload URLs for PDF resumes (REQ-4)
router.post(
  '/me/resume/presigned-url',
  authenticate,
  requireRole(['STUDENT']),
  getResumePresignedUrl
);

// Helper endpoint for TPO / Admin to manually verify student (for end-to-end testing of verification reset)
router.patch(
  '/:id/verify',
  authenticate,
  requireRole(['TPO', 'ADMIN']),
  async (req, res): Promise<void> => {
    try {
      const studentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { is_verified } = req.body;

      const updated = await prisma.student.update({
        where: { id: studentId as string },
        data: { is_verified: is_verified !== undefined ? is_verified : true },
      });

      res.status(200).json({
        success: true,
        message: `Student verification updated to ${updated.is_verified}.`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update student verification status.',
        error: error.message,
      });
    }
  }
);

export default router;
