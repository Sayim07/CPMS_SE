import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';

export const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Serve static UI assets from public folder
  app.use(express.static(path.join(__dirname, '../public')));

  // Health check & Service info
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'CPMS Authentication & RBAC Security Service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount routes
  app.use('/auth', authRoutes);
  app.use('/students', studentRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });

  return app;
};

export default createApp();
