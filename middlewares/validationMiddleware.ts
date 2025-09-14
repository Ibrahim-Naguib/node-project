import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import AppError from '../utils/appError';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Extract error messages
    const errorMessages = errors.array().map((error) => error.msg);

    // Throw AppError with validation messages
    throw new AppError(`Validation Error: ${errorMessages.join(', ')}`, 400);
  }

  next();
};

export default handleValidationErrors;
