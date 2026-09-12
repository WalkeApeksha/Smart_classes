import express from 'express';
import {
  getTimetable,
  createTimetableEntry,
  deleteTimetableEntry
} from '../controllers/timetableController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

router.get('/', getTimetable);
router.post('/', authorize('admin'), createTimetableEntry);
router.delete('/:id', authorize('admin'), deleteTimetableEntry);

export default router;
