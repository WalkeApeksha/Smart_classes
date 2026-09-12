import express from 'express';
import {
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee
} from '../controllers/feeController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

// View fees (filtered by role inside controller)
router.get('/', getAllFees);
router.get('/:id', getFeeById);

// Admin only mutations
router.post('/', authorize('admin'), createFee);
router.put('/:id', authorize('admin'), updateFee);
router.delete('/:id', authorize('admin'), deleteFee);

export default router;
