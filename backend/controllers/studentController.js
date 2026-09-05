import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Homework from '../models/Homework.js';
import Test from '../models/Test.js';
import Announcement from '../models/Announcement.js';

// @desc    Get student dashboard summary
// @route   GET /api/student/dashboard
export const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const userClass = req.user.class;

    const [attendanceRecords, activeHomework, availableTests, announcements] = await Promise.all([
      Attendance.find({ studentId }),
      Homework.find({ class: userClass, status: { $ne: 'expired' } }),
      Test.find({ class: userClass, status: 'published' }),
      Announcement.find({
        $or: [
          { targetRoles: 'student' },
          { targetRoles: { $size: 0 } },
          { targetClasses: userClass }
        ]
      }).sort({ createdAt: -1 }).limit(5)
    ]);

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.status === 'present').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '94.5';

    res.status(200).json({
      success: true,
      stats: {
        attendancePercentage,
        totalAttendanceDays: totalDays,
        pendingHomeworkCount: activeHomework.length,
        availableTestsCount: availableTests.length,
        studentName: req.user.name,
        class: req.user.class,
        rollNumber: req.user.rollNumber,
        announcements
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student attendance history
// @route   GET /api/student/attendance
export const getStudentAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ studentId: req.user._id }).sort({ date: -1 });
    res.status(200).json({ success: true, count: attendance.length, attendance });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student homework list
// @route   GET /api/student/homework
export const getStudentHomework = async (req, res, next) => {
  try {
    const homework = await Homework.find({ class: req.user.class }).sort({ dueDate: 1 });
    res.status(200).json({ success: true, homework });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit homework
// @route   POST /api/student/homework/:id/submit
export const submitHomework = async (req, res, next) => {
  try {
    const { fileUrl } = req.body;
    const homework = await Homework.findById(req.params.id);

    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    homework.submissions.push({
      studentId: req.user._id,
      studentName: req.user.name,
      fileUrl: fileUrl || 'https://sampledocs.kashvi.edu/submission.pdf',
      submittedAt: new Date()
    });

    await homework.save();
    res.status(200).json({ success: true, message: 'Homework submitted successfully!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available tests
// @route   GET /api/student/tests
export const getStudentTests = async (req, res, next) => {
  try {
    const tests = await Test.find({ class: req.user.class, status: 'published' });
    res.status(200).json({ success: true, tests });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit test attempt and auto-grade
// @route   POST /api/student/tests/:id/submit
export const submitTestAttempt = async (req, res, next) => {
  try {
    const { answers } = req.body; // { '0': 'A', '1': 'B' }
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    let score = 0;
    test.questions.forEach((q, idx) => {
      const selected = answers[idx];
      if (selected && selected.toString().trim().toLowerCase() === q.correctAnswer.toString().trim().toLowerCase()) {
        score += (q.marks || 1);
      }
    });

    const percentage = ((score / (test.totalMarks || 20)) * 100).toFixed(1);

    test.attempts.push({
      studentId: req.user._id,
      studentName: req.user.name,
      score,
      percentage: Number(percentage),
      submittedAt: new Date()
    });

    await test.save();

    res.status(200).json({
      success: true,
      message: 'Test submitted and evaluated successfully!',
      result: {
        score,
        totalMarks: test.totalMarks,
        percentage,
        isPassed: score >= (test.passingMarks || 8)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard
// @route   GET /api/student/leaderboard
export const getLeaderboard = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('name uniqueId class').limit(10);
    // Mock rankings based on simulated scores
    const leaderboard = students.map((s, idx) => ({
      rank: idx + 1,
      name: s.name,
      id: s.uniqueId,
      class: s.class || '10-A',
      points: 980 - (idx * 35),
      streak: 15 - idx
    }));

    res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    next(error);
  }
};
