import request from 'supertest';
import { createApp } from '../src/app';
import prisma from '../src/config/prisma';

const app = createApp();

describe('Phase 1: Authentication & RBAC Security Suite', () => {
  beforeAll(async () => {
    // Clear test tables before running suite
    await prisma.student.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.student.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('Task 1.1: Registration Endpoints', () => {
    describe('POST /auth/register/student', () => {
      it('should successfully register a student with is_verified: false', async () => {
        const payload = {
          email: 'aditya.student@college.edu',
          password: 'Password123!',
          name: 'Aditya Sharma',
          roll_number: '2022BCSE045',
          department: 'Computer Science',
          cgpa: 8.75,
          backlogs: 0,
        };

        const res = await request(app)
          .post('/auth/register/student')
          .send(payload);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.role).toBe('STUDENT');
        expect(res.body.data.student.roll_number).toBe('2022BCSE045');
        expect(res.body.data.student.is_verified).toBe(false); // REQ: is_verified defaults to false
      });

      it('should reject student registration with invalid roll number format', async () => {
        const payload = {
          email: 'invalid.roll@college.edu',
          password: 'Password123!',
          name: 'Invalid Roll',
          roll_number: 'ab', // Too short (< 5 chars)
          department: 'Computer Science',
        };

        const res = await request(app)
          .post('/auth/register/student')
          .send(payload);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Validation error');
      });

      it('should reject duplicate student email registration', async () => {
        const payload = {
          email: 'aditya.student@college.edu',
          password: 'AnotherPassword!',
          name: 'Duplicate Student',
          roll_number: '2022BCSE999',
        };

        const res = await request(app)
          .post('/auth/register/student')
          .send(payload);

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
      });

      it('should reject duplicate student roll number registration', async () => {
        const payload = {
          email: 'another.student@college.edu',
          password: 'AnotherPassword!',
          name: 'Duplicate Roll',
          roll_number: '2022BCSE045', // Already used
        };

        const res = await request(app)
          .post('/auth/register/student')
          .send(payload);

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
      });
    });

    describe('POST /auth/register/company', () => {
      it('should successfully register a company with status: PENDING', async () => {
        const payload = {
          email: 'recruiter@techcorp.com',
          password: 'CompanySecret123!',
          company_name: 'TechCorp Solutions',
          gst_tax_id: '27AAPFU0939F1ZV', // Valid Indian GSTIN
          website: 'https://techcorp.com',
          contact_person: 'John Recruiter',
        };

        const res = await request(app)
          .post('/auth/register/company')
          .send(payload);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.role).toBe('COMPANY');
        expect(res.body.data.company.status).toBe('PENDING'); // REQ: status defaults to PENDING
        expect(res.body.data.company.gst_tax_id).toBe('27AAPFU0939F1ZV');
      });

      it('should reject company registration with invalid GST / Tax ID format', async () => {
        const payload = {
          email: 'badgst@company.com',
          password: 'CompanySecret123!',
          company_name: 'Bad GST Ltd',
          gst_tax_id: '123', // Invalid format
        };

        const res = await request(app)
          .post('/auth/register/company')
          .send(payload);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
      });
    });
  });

  describe('Task 1.2: Login & 5-Attempt Lockout Mechanism (REQ-2)', () => {
    it('should successfully login and issue 8-hour JWT token and cpms_token cookie', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'aditya.student@college.edu',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.token_name).toBe('cpms_token');
      expect(res.body.expires_in).toBe('8h');

      // Verify cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/cpms_token=/);
    });

    it('should track failed attempts and enforce 15-minute lockout after 5 consecutive failures (HTTP 423 Locked)', async () => {
      const targetEmail = 'aditya.student@college.edu';

      // Attempts 1 to 4 should return 401 Unauthorized with remaining attempts
      for (let i = 1; i <= 4; i++) {
        const attemptRes = await request(app)
          .post('/auth/login')
          .send({
            email: targetEmail,
            password: `WrongPassword${i}`,
          });

        expect(attemptRes.status).toBe(401);
        expect(attemptRes.body.failed_login_attempts).toBe(i);
        expect(attemptRes.body.remaining_attempts).toBe(5 - i);
      }

      // 5th failed attempt should trigger lockout and return HTTP 423 Locked
      const fifthRes = await request(app)
        .post('/auth/login')
        .send({
          email: targetEmail,
          password: 'WrongPassword5',
        });

      expect(fifthRes.status).toBe(423);
      expect(fifthRes.body.success).toBe(false);
      expect(fifthRes.body.failed_login_attempts).toBe(5);
      expect(fifthRes.body.locked_until).toBeDefined();
      expect(fifthRes.body.message).toMatch(/Account locked/i);

      // 6th attempt (even with correct password) should still be rejected with HTTP 423 Locked
      const lockedRes = await request(app)
        .post('/auth/login')
        .send({
          email: targetEmail,
          password: 'Password123!', // Correct password but account is locked
        });

      expect(lockedRes.status).toBe(423);
      expect(lockedRes.body.message).toMatch(/Account is temporarily locked/i);
    });

    it('should reset failed login attempts upon successful login after unlocking', async () => {
      // Manually reset lock_until to simulate 15-minute expiry
      await prisma.user.update({
        where: { email: 'aditya.student@college.edu' },
        data: {
          lock_until: new Date(Date.now() - 1000), // Expired 1 second ago
        },
      });

      // Now logging in with correct password should succeed and reset failed attempts
      const successRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'aditya.student@college.edu',
          password: 'Password123!',
        });

      expect(successRes.status).toBe(200);

      // Check database state
      const user = await prisma.user.findUnique({
        where: { email: 'aditya.student@college.edu' },
      });
      expect(user?.failed_login_attempts).toBe(0);
      expect(user?.lock_until).toBeNull();
    });
  });

  describe('Task 1.3: RBAC Middleware (authenticate, requireRole)', () => {
    let studentToken: string;

    beforeAll(async () => {
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'aditya.student@college.edu',
          password: 'Password123!',
        });
      studentToken = loginRes.body.token;
    });

    it('should reject unauthenticated access with HTTP 401 Unauthorized', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should allow access to /auth/me with valid Bearer token', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('aditya.student@college.edu');
      expect(res.body.user.role).toBe('STUDENT');
    });

    it('should reject unauthorized role access with HTTP 403 Forbidden (requireRole)', async () => {
      // Student attempting to access ADMIN route
      const res = await request(app)
        .get('/auth/admin-only')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Forbidden/i);
    });
  });
});
