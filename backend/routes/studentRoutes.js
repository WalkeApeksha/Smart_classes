import express from 'express';
import {
  getStudentDashboard,
  getStudentAttendance,
  getStudentHomework,
  submitHomework,
  getStudentTests,
  submitTestAttempt,
  getLeaderboard
} from '../controllers/studentController.js';
import { generateAIStudyPlan } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student', 'admin'));

router.get('/dashboard', getStudentDashboard);
router.get('/attendance', getStudentAttendance);
router.get('/homework', getStudentHomework);
router.post('/homework/:id/submit', submitHomework);
router.get('/tests', getStudentTests);
router.post('/tests/:id/submit', submitTestAttempt);
router.get('/leaderboard', getLeaderboard);
router.post('/study-plan', generateAIStudyPlan);

export default router;
