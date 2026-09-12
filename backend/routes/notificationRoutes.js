import express from 'express';
import { broadcastNotification } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);
router.post('/broadcast', authorize('admin', 'teacher'), broadcastNotification);

export default router;
