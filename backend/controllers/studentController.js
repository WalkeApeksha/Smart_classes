import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Homework from '../models/Homework.js';
import Test from '../models/Test.js';
import Report from '../models/Report.js';
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
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

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
    res.status(200).json({ success: true, count: homework.length, homework });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit homework with duplicate prevention / update
// @route   POST /api/student/homework/:id/submit
export const submitHomework = async (req, res, next) => {
  try {
    const { fileUrl } = req.body;
    const homework = await Homework.findById(req.params.id);

    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework task not found' });
    }

    if (homework.class !== req.user.class) {
      return res.status(403).json({ success: false, message: 'This homework is not assigned to your class' });
    }

    // Check if student has already submitted
    const existingIndex = homework.submissions.findIndex(
      s => s.studentId && s.studentId.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      // Update existing submission (Controlled resubmission update)
      homework.submissions[existingIndex].fileUrl = fileUrl || homework.submissions[existingIndex].fileUrl;
      homework.submissions[existingIndex].submittedAt = new Date();
      homework.submissions[existingIndex].feedback = 'Resubmitted / Updated';
      await homework.save();

      return res.status(200).json({
        success: true,
        message: 'Homework submission updated successfully!',
        submission: homework.submissions[existingIndex]
      });
    }

    // New submission
    const newSubmission = {
      studentId: req.user._id,
      studentName: req.user.name,
      fileUrl: fileUrl || 'https://sampledocs.kashvi.edu/submission.pdf',
      submittedAt: new Date()
    };

    homework.submissions.push(newSubmission);
    await homework.save();

    res.status(200).json({
      success: true,
      message: 'Homework submitted successfully!',
      submission: newSubmission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available tests
// @route   GET /api/student/tests
export const getStudentTests = async (req, res, next) => {
  try {
    const tests = await Test.find({ class: req.user.class, status: 'published' });
    res.status(200).json({ success: true, count: tests.length, tests });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit test attempt and calculate dynamic auto-graded score
// @route   POST /api/student/tests/:id/submit
export const submitTestAttempt = async (req, res, next) => {
  try {
    const { answers } = req.body; // e.g. { '0': 'A', '1': 'B' } or { '0': 1, '1': 0 }
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    const totalQuestions = test.questions.length;

    test.questions.forEach((q, idx) => {
      const selected = answers ? answers[idx] : undefined;
      if (selected !== undefined && selected !== null && selected.toString().trim().toLowerCase() === q.correctAnswer.toString().trim().toLowerCase()) {
        score += (q.marks || 1);
        correctCount++;
      } else if (selected !== undefined && selected !== null) {
        wrongCount++;
      }
    });

    const totalMarks = test.totalMarks || (totalQuestions * 1);
    const percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(1)) : 0;
    const isPassed = score >= (test.passingMarks || Math.ceil(totalMarks * 0.4));

    // Deduplicate / update attempt if already taken
    const existingAttemptIndex = test.attempts.findIndex(
      a => a.studentId && a.studentId.toString() === req.user._id.toString()
    );

    const attemptData = {
      studentId: req.user._id,
      studentName: req.user.name,
      score,
      percentage,
      submittedAt: new Date()
    };

    if (existingAttemptIndex > -1) {
      test.attempts[existingAttemptIndex] = attemptData;
    } else {
      test.attempts.push(attemptData);
    }

    await test.save();

    res.status(200).json({
      success: true,
      message: 'Test evaluated successfully!',
      result: {
        score,
        totalMarks,
        totalQuestions,
        correctCount,
        wrongCount,
        percentage,
        isPassed
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dynamic student leaderboard based on real academic scores
// @route   GET /api/student/leaderboard
export const getLeaderboard = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('name uniqueId class');
    const studentIds = students.map(s => s._id);

    // Fetch real test attempts and report card scores
    const [allTests, allReports, allAttendance] = await Promise.all([
      Test.find({ 'attempts.studentId': { $in: studentIds } }),
      Report.find({ studentId: { $in: studentIds } }),
      Attendance.find({ studentId: { $in: studentIds } })
    ]);

    // Aggregate performance per student
    const studentMetrics = students.map(student => {
      let totalTestScore = 0;
      let testsAttempted = 0;

      allTests.forEach(test => {
        const attempt = test.attempts.find(a => a.studentId && a.studentId.toString() === student._id.toString());
        if (attempt) {
          totalTestScore += Number(attempt.score || 0);
          testsAttempted++;
        }
      });

      let reportScore = 0;
      const studentReports = allReports.filter(r => r.studentId && r.studentId.toString() === student._id.toString());
      studentReports.forEach(r => {
        reportScore += Number(r.totalMarks || 0);
      });

      const studentAttendance = allAttendance.filter(a => a.studentId && a.studentId.toString() === student._id.toString());
      const presentCount = studentAttendance.filter(a => a.status === 'present').length;
      const attendancePoints = presentCount * 5; // 5 pts per present day

      // Total dynamic points formula
      const totalPoints = (totalTestScore * 10) + reportScore + attendancePoints;

      return {
        id: student.uniqueId || student._id,
        name: student.name,
        class: student.class || '10-A',
        points: totalPoints,
        testsCompleted: testsAttempted,
        presentDays: presentCount
      };
    });

    // Sort by points descending
    studentMetrics.sort((a, b) => b.points - a.points);

    // Assign dynamic ranks (handling ties)
    let currentRank = 1;
    const rankedLeaderboard = studentMetrics.map((item, index) => {
      if (index > 0 && item.points < studentMetrics[index - 1].points) {
        currentRank = index + 1;
      }
      return {
        rank: currentRank,
        ...item
      };
    });

    res.status(200).json({ success: true, count: rankedLeaderboard.length, leaderboard: rankedLeaderboard });
  } catch (error) {
    next(error);
  }
};
