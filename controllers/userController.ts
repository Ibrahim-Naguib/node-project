import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import AppError from '../utils/appError';
import { ApiResponse, UpdateUserData, ChangePasswordData } from '../types';

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers: RequestHandler<{}, ApiResponse> = asyncHandler(
  async (req, res) => {
    const users = await User.find({});

    const response: ApiResponse = {
      success: true,
      data: {
        users,
        count: users.length,
      },
    };

    res.json(response);
  }
);

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById: RequestHandler<{ id: string }, ApiResponse> =
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.json(response);
  });

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile: RequestHandler<{}, ApiResponse> = asyncHandler(
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile: RequestHandler<{}, ApiResponse, UpdateUserData> =
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const { firstName, lastName, email } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError('Email already in use', 400);
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    };

    res.json(response);
  });

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword: RequestHandler<
  {},
  ApiResponse,
  ChangePasswordData
> = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  const response: ApiResponse = {
    success: true,
    message: 'Password changed successfully',
  };

  res.json(response);
});

// @desc    Update user by ID (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser: RequestHandler<
  { id: string },
  ApiResponse,
  UpdateUserData
> = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, role } = req.body;
  const userId = req.params.id;

  // Check if email is being changed and if it's already taken
  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(role && { role }),
    },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    data: updatedUser,
    message: 'User updated successfully',
  };

  res.json(response);
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser: RequestHandler<{ id: string }, ApiResponse> =
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    await User.findByIdAndDelete(req.params.id);

    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully',
    };

    res.json(response);
  });

// TODO: Add user avatar upload functionality

// @desc    Upload user avatar
// @route   POST /api/users/profile/avatar
// @access  Private
export const uploadAvatar: RequestHandler = asyncHandler(
  async (req, res) => {}
);
