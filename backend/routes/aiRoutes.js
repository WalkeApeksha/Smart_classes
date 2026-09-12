import express from 'express';
import { generateAIStudyPlan, getLatestStudyPlan } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/study-plan/latest', getLatestStudyPlan);
router.post('/study-plan', generateAIStudyPlan);

export default router;
