import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { initJobScheduler } from "./jobs/closeExpiredJobs";

// Initialize deadline auto-close cron scheduler
initJobScheduler();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 CPMS Server running on http://localhost:${env.PORT}`);
  logger.info(`Health check available at http://localhost:${env.PORT}/api/v1/health`);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    logger.info("Process terminated.");
  });
});
