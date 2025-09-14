import { Router, type IRouter } from 'express';
import { register, login } from '../controllers/authController';
import {
  createUserValidator,
  loginValidator,
} from '../utils/validators/userValidator';

const router: IRouter = Router();

// Public routes
router.post('/register', createUserValidator, register);
router.post('/login', loginValidator, login);

// TODO: Add forgot password route
// TODO: Add reset password route
// TODO: Add email verification route

export default router;
