import express from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import teacherRoutes from './teacherRoutes.js';
import studentRoutes from './studentRoutes.js';
import parentRoutes from './parentRoutes.js';
import feeRoutes from './feeRoutes.js';
import reportRoutes from './reportRoutes.js';
import studyMaterialRoutes from './studyMaterialRoutes.js';
import timetableRoutes from './timetableRoutes.js';
import onlineClassRoutes from './onlineClassRoutes.js';
import aiRoutes from './aiRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/teacher', teacherRoutes);
router.use('/student', studentRoutes);
router.use('/parent', parentRoutes);
router.use('/fees', feeRoutes);
router.use('/reports', reportRoutes);
router.use('/notes', studyMaterialRoutes);
router.use('/timetable', timetableRoutes);
router.use('/online-classes', onlineClassRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationRoutes);

export default router;
