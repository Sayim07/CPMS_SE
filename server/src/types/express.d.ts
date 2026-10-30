import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email: string;
      role: Role;
      full_name: string;
      company_id?: string;
      student_id?: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};

