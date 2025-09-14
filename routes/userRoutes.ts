import { Router, type IRouter } from 'express';
import {
  getAllUsers,
  getUserById,
  getProfile,
  updateProfile,
  changePassword,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { protect, adminOnly } from '../middlewares/authMiddleware';
import {
  updateUserValidator,
  changePasswordValidator,
} from '../utils/validators/userValidator';

const router: IRouter = Router();

// Apply auth middleware to all routes
router.use(protect);

// User profile routes (authenticated user managing their own profile)
router.get('/profile', getProfile);
router.put('/profile', updateUserValidator, updateProfile);
router.put('/change-password', changePasswordValidator, changePassword);

// Admin only routes for user management
router.use(adminOnly); // Apply admin check to all routes below

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUserValidator, updateUser);
router.delete('/:id', deleteUser);

export default router;
