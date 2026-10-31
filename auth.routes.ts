import { Router } from 'express';
import { registerStudent, registerCompany, login, logout } from '../controllers/auth.controller';
import { validateBody, registerStudentSchema, registerCompanySchema, loginSchema } from '../middleware/validation.middleware';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Task 1.1: Registration Endpoints
router.post('/register/student', validateBody(registerStudentSchema), registerStudent);
router.post('/register/company', validateBody(registerCompanySchema), registerCompany);

// Task 1.2: Login Endpoint (with 5-attempt lockout)
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', logout);

// Role verification test endpoints for RBAC demonstration
router.get('/me', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User authenticated successfully.',
    user: req.user,
  });
});

router.get('/admin-only', authenticate, requireRole(['ADMIN']), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Admin!',
    user: req.user,
  });
});

router.get('/tpo-only', authenticate, requireRole(['TPO', 'ADMIN']), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome TPO Officer!',
    user: req.user,
  });
});

export default router;
