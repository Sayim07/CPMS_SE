import cron from "node-cron";
import { JobStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";

/**
 * Closes all active jobs whose application deadline has passed.
 * Returns the count of closed jobs.
 */
export async function closeExpiredJobs(): Promise<number> {
  try {
    const now = new Date();
    const result = await prisma.job.updateMany({
      where: {
        status: JobStatus.ACTIVE,
        application_deadline: {
          lt: now,
        },
      },
      data: {
        status: JobStatus.CLOSED,
      },
    });

    if (result.count > 0) {
      logger.info(`⏰ Automatically closed ${result.count} expired job drives.`);
    }
    return result.count;
  } catch (err) {
    logger.warn({ err }, "Failed to execute closeExpiredJobs cron task");
    return 0;
  }
}

/**
 * Initializes the cron runner that executes every minute.
 */
export function initJobScheduler() {
  // Runs at second 0 of every minute
  const task = cron.schedule("* * * * *", async () => {
    await closeExpiredJobs();
  });
  logger.info("🕒 Initialized deadline auto-close cron scheduler (runs every minute)");
  return task;
}

