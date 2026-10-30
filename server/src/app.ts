import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { Role } from "@prisma/client";
import { env } from "./config/env";
import { healthRouter } from "./routes/health";
import { jobsRouter } from "./routes/jobs";
import { tpoRouter } from "./routes/tpo";
import { reportsRouter } from "./routes/reports";
import { adminRouter } from "./routes/admin";
import { authenticate, requireRole } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Route Mounts conforming to Schema.md §4 Base Path /api/v1
app.use("/api/v1", healthRouter);
app.use("/api/v1", jobsRouter);
app.use("/api/v1/tpo", authenticate, requireRole([Role.TPO, Role.ADMIN]), tpoRouter);
app.use("/api/v1/reports", authenticate, requireRole([Role.TPO, Role.ADMIN]), reportsRouter);
app.use("/api/v1/admin", authenticate, requireRole([Role.ADMIN]), adminRouter);

// Root fallback for health checks
app.use("/", healthRouter);

// 404 Handler conforming to Schema.md §4
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Endpoint ${req.method} ${req.path} not found.`,
    },
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);
