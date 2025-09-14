import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import AppError from '../utils/appError';
import { JwtPayload } from '../types';

/**
 * Middleware to protect routes - requires valid JWT token
 */
export const protect: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1) Get token from headers
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError(
        'You are not logged in! Please log in to get access.',
        401
      );
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.userId);

    if (!currentUser) {
      throw new AppError(
        'The user belonging to this token does no longer exist.',
        401
      );
    }

    // 4) Grant access to protected route
    req.user = currentUser;

    next();
  }
);

/**
 * Middleware to restrict access to specific roles
 * @param roles - Array of roles that are allowed to access the route
 */
export const allowedTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('You must be logged in to access this route.', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        'You do not have permission to perform this action.',
        403
      );
    }

    next();
  };
};

// Specific role middlewares for convenience
export const adminOnly = allowedTo('admin');
export const userOrAdmin = allowedTo('user', 'admin');
