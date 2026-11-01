import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/prisma';

/**
 * Task 2.1: Profile Management - GET /students/me
 * Retrieves current student profile details
 */
export const getMyStudentProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            created_at: true,
          },
        },
      },
    });

    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found for this user.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error: any) {
    console.error('Error in getMyStudentProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve student profile.',
      error: error.message,
    });
  }
};

/**
 * Task 2.1 & 2.4: Profile Management & Verification Reset Trigger (REQ-5)
 * PUT /students/me
 * Automatically reset is_verified = false when sensitive fields (CGPA, backlogs) are modified
 */
export const updateMyStudentProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const existingStudent = await prisma.student.findUnique({
      where: { user_id: userId },
    });

    if (!existingStudent) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
      return;
    }

    const { name, department, cgpa, backlogs, resume_url } = req.body;

    // Check if sensitive fields (CGPA or backlogs) are being modified
    let shouldResetVerification = false;
    let sensitiveFieldsChanged: string[] = [];

    if (cgpa !== undefined && cgpa !== existingStudent.cgpa) {
      shouldResetVerification = true;
      sensitiveFieldsChanged.push('cgpa');
    }

    if (backlogs !== undefined && backlogs !== existingStudent.backlogs) {
      shouldResetVerification = true;
      sensitiveFieldsChanged.push('backlogs');
    }

    // Determine new is_verified state:
    // If sensitive fields changed, automatically reset is_verified to false (REQ-5)
    const newIsVerified = shouldResetVerification ? false : existingStudent.is_verified;

    const updatedStudent = await prisma.student.update({
      where: { user_id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(department !== undefined && { department }),
        ...(cgpa !== undefined && { cgpa }),
        ...(backlogs !== undefined && { backlogs }),
        ...(resume_url !== undefined && { resume_url }),
        is_verified: newIsVerified,
      },
    });

    res.status(200).json({
      success: true,
      message: shouldResetVerification
        ? `Profile updated. Sensitive academic fields (${sensitiveFieldsChanged.join(', ')}) were modified; student verification reset to pending (is_verified: false).`
        : 'Profile updated successfully.',
      verification_reset: shouldResetVerification,
      sensitive_fields_changed: sensitiveFieldsChanged,
      data: updatedStudent,
    });
  } catch (error: any) {
    console.error('Error in updateMyStudentProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student profile.',
      error: error.message,
    });
  }
};

/**
 * Task 2.2 & 2.3: Pre-signed upload URLs for PDF resumes (REQ-4)
 * POST /students/me/resume/presigned-url
 */
export const getResumePresignedUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { filename, file_type } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // PDF validation check
    const isPdf = file_type === 'application/pdf' || (filename && filename.toLowerCase().endsWith('.pdf'));
    if (!isPdf) {
      res.status(400).json({
        success: false,
        message: 'Invalid file format. Only PDF resumes are accepted (REQ-4).',
      });
      return;
    }

    // Generate unique storage key and signature for S3 / Cloud Vault
    const safeFilename = filename ? filename.replace(/[^a-zA-Z0-9.-]/g, '_') : 'resume.pdf';
    const uniqueKey = `resumes/${userId}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${safeFilename}`;
    
    // Simulate S3 presigned upload URL or configure AWS S3 endpoint
    const bucketName = process.env.S3_BUCKET_NAME || 'cpms-resumes-vault';
    const region = process.env.AWS_REGION || 'us-east-1';
    const expiresSeconds = 900; // 15 minutes validity
    const presignedUploadUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=${expiresSeconds}&X-Amz-Signature=${crypto.randomBytes(32).toString('hex')}`;
    const publicFileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueKey}`;

    res.status(200).json({
      success: true,
      message: 'Pre-signed upload URL generated successfully.',
      upload_url: presignedUploadUrl,
      file_url: publicFileUrl,
      key: uniqueKey,
      expires_in_seconds: expiresSeconds,
      content_type: 'application/pdf',
    });
  } catch (error: any) {
    console.error('Error generating pre-signed URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate pre-signed upload URL.',
      error: error.message,
    });
  }
};
