import express from 'express';
import {
  getChildren,
  getChildAttendance,
  getChildFees,
  payFee,
  getChildReports
} from '../controllers/parentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);
router.use(authorize('parent', 'admin'));

router.get('/children', getChildren);
router.get('/children/:id/attendance', getChildAttendance);
router.get('/children/:id/fees', getChildFees);
router.get('/children/:id/reports', getChildReports);
router.post('/fees/pay', payFee);

export default router;
