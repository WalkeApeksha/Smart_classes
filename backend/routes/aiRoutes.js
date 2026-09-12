import express from 'express';
import { generateAIStudyPlan } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/study-plan', generateAIStudyPlan);

export default router;
