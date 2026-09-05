import Attendance from '../models/Attendance.js';
import Homework from '../models/Homework.js';
import Test from '../models/Test.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

// @desc    Mark attendance for a batch/class
// @route   POST /api/teacher/attendance/mark
export const markAttendance = async (req, res, next) => {
  try {
    const { class: className, date, records, subject } = req.body;
    // records: [{ studentId, studentName, status, remark }]

    const formattedDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(formattedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(formattedDate.setHours(23, 59, 59, 999));

    const operations = records.map(rec => ({
      updateOne: {
        filter: {
          studentId: rec.studentId,
          date: { $gte: startOfDay, $lte: endOfDay }
        },
        update: {
          $set: {
            studentName: rec.studentName,
            class: className,
            date: startOfDay,
            status: rec.status || 'present',
            markedBy: req.user._id,
            subject: subject || 'General',
            remark: rec.remark || ''
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(operations);

    res.status(200).json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records
// @route   GET /api/teacher/attendance
export const getAttendance = async (req, res, next) => {
  try {
    const { class: className, date } = req.query;
    let query = {};
    if (className) query.class = className;
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      query.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: attendance.length, attendance });
  } catch (error) {
    next(error);
  }
};

// @desc    Get students assigned to this teacher
// @route   GET /api/teacher/my-students
export const getMyStudents = async (req, res, next) => {
  try {
    const assignedClasses = req.user.assignedClasses || [];
    let query = { role: 'student' };
    if (assignedClasses.length > 0) {
      query.class = { $in: assignedClasses };
    }

    const students = await User.find(query).select('-password').sort({ class: 1, rollNumber: 1 });
    res.status(200).json({ success: true, count: students.length, students });
  } catch (error) {
    next(error);
  }
};

// Homework operations
export const createHomework = async (req, res, next) => {
  try {
    const homework = await Homework.create({
      ...req.body,
      teacherId: req.user._id,
      teacherName: req.user.name
    });
    res.status(201).json({ success: true, homework });
  } catch (error) {
    next(error);
  }
};

export const getHomeworkList = async (req, res, next) => {
  try {
    const homework = await Homework.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, homework });
  } catch (error) {
    next(error);
  }
};

export const updateHomework = async (req, res, next) => {
  try {
    const homework = await Homework.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, homework });
  } catch (error) {
    next(error);
  }
};

export const deleteHomework = async (req, res, next) => {
  try {
    await Homework.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Homework deleted' });
  } catch (error) {
    next(error);
  }
};

// Tests operations
export const createTest = async (req, res, next) => {
  try {
    const test = await Test.create({
      ...req.body,
      teacherId: req.user._id
    });
    res.status(201).json({ success: true, test });
  } catch (error) {
    next(error);
  }
};

export const getTests = async (req, res, next) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, tests });
  } catch (error) {
    next(error);
  }
};

export const updateTest = async (req, res, next) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, test });
  } catch (error) {
    next(error);
  }
};
