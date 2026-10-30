import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";

export interface JwtTokenPayload {
  sub: string;
  email: string;
  role: Role;
  full_name: string;
  company_id?: string;
  student_id?: string;
}

export function signToken(payload: JwtTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "8h" });
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication token missing or invalid format.",
      },
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtTokenPayload;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      full_name: decoded.full_name,
      company_id: decoded.company_id,
      student_id: decoded.student_id,
    };
    next();
  } catch {
    return res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message: "Invalid or expired authentication token.",
      },
    });
  }
}

export function requireRole(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "User context not found.",
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to perform this action.",
        },
      });
    }

    next();
  };
}

