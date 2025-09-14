import { Request, Response, RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import AppError from '../utils/appError';
import { generateToken } from '../utils/generateToken';
import { ApiResponse, LoginCredentials, RegisterData } from '../types';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register: RequestHandler<{}, ApiResponse, RegisterData> =
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'user',
    });

    // Generate token
    const token = generateToken(user._id);

    const response: ApiResponse = {
      success: true,
      data: {
        user,
        token,
      },
      message: 'User registered successfully',
    };

    res.status(201).json(response);
  });

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login: RequestHandler<{}, ApiResponse, LoginCredentials> =
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists and get password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user._id);

    const response: ApiResponse = {
      success: true,
      data: {
        user,
        token,
      },
      message: 'Login successful',
    };

    res.json(response);
  });

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe: RequestHandler<{}, ApiResponse> = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: req.user,
    };

    res.json(response);
  }
);

// TODO: Add forgot password functionality
// TODO: Add reset password functionality
// TODO: Add email verification functionality
