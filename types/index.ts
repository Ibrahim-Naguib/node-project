// ============================================
// BARREL EXPORT - Central export for all types
// ============================================

export * from './api';
export * from './auth';
export * from './query';
export * from './config';
export * from './models';

// ============================================
// GLOBAL EXPRESS EXTENSIONS
// ============================================

declare global {
  namespace Express {
    interface Request {
      user?: import('./models').IUser;
    }
  }
}
