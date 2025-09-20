import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import User from '../models/User';
import AppError from '../utils/appError';
import { generateToken } from '../utils/generateToken';
import {
  ApiResponse,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  VerifyResetCodeData,
  ResetPasswordData,
} from '../types';
import { sendEmail } from '@/utils/sendEmail';

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

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword: RequestHandler<
  {},
  ApiResponse,
  ForgotPasswordData
> = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    throw new AppError(
      `There is no user with that email ${req.body.email}`,
      404
    );
  }

  // 2) If user exist, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  // Save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.passwordResetVerified = false;

  await user.save();

  // 3) Send the reset code via email (for now, just log it)
  const fullName = user.getFullName();

  // TODO: Implement email sending
  const message = `Hi ${fullName},\n We received a request to reset the password on your account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Your password reset code (valid for 10 min)',
      text: message,
    });
  } catch (error) {
    // In case of error, clear the reset code fields
    delete user.passwordResetCode;
    delete user.passwordResetExpires;
    delete user.passwordResetVerified;
    await user.save();

    throw new AppError(
      'There was an error sending the email. Try again later!',
      500
    );
  }

  // 4) Respond with success message

  const response: ApiResponse = {
    success: true,
    message: 'Reset code sent to email',
  };

  res.status(200).json(response);
});

// @desc    Verify password reset code
// @route   POST /api/auth/verify-reset-code
// @access  Public
export const verifyPassResetCode: RequestHandler<
  {},
  ApiResponse,
  VerifyResetCodeData
> = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(String(req.body.resetCode))
    .digest('hex');

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new AppError('Reset code invalid or expired', 400);
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();

  const response: ApiResponse = {
    success: true,
    message: 'Reset code verified successfully',
  };

  res.status(200).json(response);
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword: RequestHandler<{}, ApiResponse, ResetPasswordData> =
  asyncHandler(async (req, res, next) => {
    // 1) Get user based on email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new AppError(`There is no user with email ${req.body.email}`, 404);
    }

    // 2) Check if reset code verified
    if (!user.passwordResetVerified) {
      throw new AppError('Reset code not verified', 400);
    }

    user.password = req.body.newPassword;
    delete user.passwordResetCode;
    delete user.passwordResetExpires;
    delete user.passwordResetVerified;

    await user.save();

    // 3) Generate token
    const token = generateToken(user._id);

    const response: ApiResponse = {
      success: true,
      data: {
        user,
        token,
      },
      message: 'Password reset successfully',
    };

    res.status(200).json(response);
  });
