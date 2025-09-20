import { Router, type IRouter } from 'express';
import {
  register,
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} from '../controllers/authController';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyResetCodeValidator,
  resetPasswordValidator,
} from '../utils/validators/authValidator';

const router: IRouter = Router();

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Password reset routes
router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.post(
  '/verify-reset-code',
  verifyResetCodeValidator,
  verifyPassResetCode
);
router.post('/reset-password', resetPasswordValidator, resetPassword);

export default router;
