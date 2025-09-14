// ============================================
// MODEL TYPES - Shared across the application
// ============================================

import { Document } from 'mongoose';

// User interface
export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

// Course interface (for future use)
export interface ICourse extends Document {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
}
