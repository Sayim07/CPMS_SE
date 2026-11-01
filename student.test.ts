import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app';
import prisma from '../src/config/prisma';

const app = createApp();

describe('Phase 2: Student Profile & Verification Reset Suite', () => {
  let studentToken: string;
  let studentId: string;
  let adminToken: string;

  beforeAll(async () => {
    // Clear database
    await prisma.student.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});

    // Register a student
    const studentReg = await request(app)
      .post('/auth/register/student')
      .send({
        email: 'priya.sharma@college.edu',
        password: 'Password123!',
        name: 'Priya Sharma',
        roll_number: '2022BCSE101',
        department: 'Information Technology',
        cgpa: 8.9,
        backlogs: 0,
      });

    studentId = studentReg.body.data.student.id;

    // Login as student
    const studentLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'priya.sharma@college.edu',
        password: 'Password123!',
      });
    studentToken = studentLogin.body.token;

    // Create an Admin/TPO user for verification tests
    const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
    const adminUser = await prisma.user.create({
      data: {
        email: 'tpo.officer@college.edu',
        password: hashedPassword,
        role: 'TPO',
      },
    });

    const tpoLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'tpo.officer@college.edu',
        password: 'AdminPassword123!',
      });
    adminToken = tpoLogin.body.token;
  });

  afterAll(async () => {
    await prisma.student.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('Task 2.1: Profile Management (GET/PUT /students/me)', () => {
    it('should retrieve current student profile via GET /students/me', async () => {
      const res = await request(app)
        .get('/students/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roll_number).toBe('2022BCSE101');
      expect(res.body.data.name).toBe('Priya Sharma');
      expect(res.body.data.is_verified).toBe(false);
    });

    it('should update non-sensitive student profile fields via PUT /students/me', async () => {
      const res = await request(app)
        .put('/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Priya K. Sharma',
          department: 'Computer Science & Engineering',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Priya K. Sharma');
      expect(res.body.data.department).toBe('Computer Science & Engineering');
      expect(res.body.verification_reset).toBe(false);
    });
  });

  describe('Task 2.2 & 2.3: Resume Storage Pre-signed URLs (REQ-4)', () => {
    it('should generate pre-signed upload URL for PDF resume', async () => {
      const res = await request(app)
        .post('/students/me/resume/presigned-url')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          filename: 'Priya_Sharma_Resume.pdf',
          file_type: 'application/pdf',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.upload_url).toBeDefined();
      expect(res.body.file_url).toMatch(/\.pdf$/);
      expect(res.body.content_type).toBe('application/pdf');
    });

    it('should reject non-PDF resume upload requests (REQ-4 format restriction)', async () => {
      const res = await request(app)
        .post('/students/me/resume/presigned-url')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          filename: 'malicious_script.exe',
          file_type: 'application/x-msdownload',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Only PDF resumes/i);
    });
  });

  describe('Task 2.4: Verification Reset Trigger on Sensitive Edit (REQ-5)', () => {
    it('should reset is_verified to false when CGPA or backlogs are modified', async () => {
      // 1. First, TPO Officer marks student profile as verified
      const verifyRes = await request(app)
        .patch(`/students/${studentId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_verified: true });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.is_verified).toBe(true);

      // Verify that student profile is verified
      const profileCheck = await request(app)
        .get('/students/me')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(profileCheck.body.data.is_verified).toBe(true);

      // 2. Student updates non-sensitive field (e.g. name only) -> verification remains true
      const editNameRes = await request(app)
        .put('/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ name: 'Priya Kumari Sharma' });

      expect(editNameRes.status).toBe(200);
      expect(editNameRes.body.verification_reset).toBe(false);
      expect(editNameRes.body.data.is_verified).toBe(true);

      // 3. Student updates CGPA (sensitive field) -> REQ-5 triggers reset to false!
      const editCgpaRes = await request(app)
        .put('/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ cgpa: 9.4 });

      expect(editCgpaRes.status).toBe(200);
      expect(editCgpaRes.body.verification_reset).toBe(true);
      expect(editCgpaRes.body.sensitive_fields_changed).toContain('cgpa');
      expect(editCgpaRes.body.data.is_verified).toBe(false);

      // 4. Verify in DB via GET /students/me that is_verified is now false
      const finalCheck = await request(app)
        .get('/students/me')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(finalCheck.body.data.is_verified).toBe(false);
    });
  });
});
