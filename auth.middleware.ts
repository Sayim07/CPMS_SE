import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { Role } from '../types';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  studentId?: string;
  companyId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Task 1.3: authenticate middleware
 * Extracts Bearer token from Authorization header or cpms_token cookie,
 * verifies JWT, and attaches user payload to req.user.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined;

    // 1. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Fallback to cookies if cpms_token is present
    if (!token && req.cookies && req.cookies.cpms_token) {
      token = req.cookies.cpms_token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
};

/**
 * Task 1.3: requireRole middleware
 * Rejects unauthorized role access with HTTP 403 Forbidden.
 * Example: requireRole(['STUDENT', 'ADMIN'])
 */
export const requireRole = (allowedRoles: (Role | string)[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required before role verification.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Role '${req.user.role}' is not authorized. Allowed roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};
