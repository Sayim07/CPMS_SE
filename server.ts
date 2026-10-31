import { createApp } from './app';
import { ENV } from './config/env';
import prisma from './config/prisma';

const app = createApp();

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log(' Connected to SQLite database via Prisma');

    const server = app.listen(ENV.PORT, () => {
      console.log(` CPMS Authentication & Security Backend running on port ${ENV.PORT}`);
      console.log(` Health check: http://localhost:${ENV.PORT}/health`);
      console.log(` Student Register: POST http://localhost:${ENV.PORT}/auth/register/student`);
      console.log(` Company Register: POST http://localhost:${ENV.PORT}/auth/register/company`);
      console.log(` Login (REQ-2 Lockout): POST http://localhost:${ENV.PORT}/auth/login`);
    });

    const shutdown = async () => {
      console.log('Shutting down server...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Server and database disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
