import express from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import teacherRoutes from './teacherRoutes.js';
import studentRoutes from './studentRoutes.js';
import parentRoutes from './parentRoutes.js';
import { getAllFees, createFee, updateFee } from '../controllers/feeController.js';
import { getReports, createReport } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/teacher', teacherRoutes);
router.use('/student', studentRoutes);
router.use('/parent', parentRoutes);

// Shared fee & report endpoints
router.get('/fees', protect, getAllFees);
router.post('/fees', protect, createFee);
router.put('/fees/:id', protect, updateFee);

router.get('/reports', protect, getReports);
router.post('/reports', protect, createReport);

export default router;
