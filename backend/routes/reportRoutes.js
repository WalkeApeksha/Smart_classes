import express from 'express';
import { getReports, createReport } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

router.get('/', getReports);
router.post('/', authorize('admin', 'teacher'), createReport);

export default router;
