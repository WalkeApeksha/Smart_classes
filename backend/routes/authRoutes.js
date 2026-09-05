import express from 'express';
import {
  login,
  register,
  forgotPassword,
  verifyOtp,
  resetPassword,
  verify2FA,
  enable2FA,
  getMe,
  updateProfile,
  changePassword,
  logout
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import { loginValidation, registerValidation, validateRequest } from '../utils/validators.js';

const router = express.Router();

router.post('/login', loginValidation, validateRequest, login);
router.post('/register', protect, authorize('admin'), registerValidation, validateRequest, register);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/verify-2fa', verify2FA);

// Protected Auth Routes
router.post('/enable-2fa', protect, enable2FA);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router;
