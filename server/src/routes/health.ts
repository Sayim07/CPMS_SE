import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const healthRouter = Router();

healthRouter.get("/health", async (req: Request, res: Response) => {
  let dbStatus = "down";
  try {
    // Timeout the DB ping after 500ms so the endpoint remains fast even if DB is offline
    const pingPromise = prisma.$queryRaw`SELECT 1`.then(() => "up").catch(() => "down");
    const timeoutPromise = new Promise<string>((resolve) =>
      setTimeout(() => resolve("down"), 500)
    );
    dbStatus = await Promise.race([pingPromise, timeoutPromise]);
  } catch {
    dbStatus = "down";
  }

  res.status(200).json({
    data: {
      status: "ok",
      db: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});
