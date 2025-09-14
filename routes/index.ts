import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';

const router: Router = Router();

// Root endpoint
router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Course Management API',
    version: '1.0.0',
    status: 'running',
  });
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
