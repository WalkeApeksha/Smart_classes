import express from 'express';
import {
  getOnlineClasses,
  createOnlineClass,
  updateOnlineClass,
  deleteOnlineClass
} from '../controllers/onlineClassController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

router.get('/', getOnlineClasses);
router.post('/', authorize('admin', 'teacher'), createOnlineClass);
router.put('/:id', authorize('admin', 'teacher'), updateOnlineClass);
router.delete('/:id', authorize('admin', 'teacher'), deleteOnlineClass);

export default router;
