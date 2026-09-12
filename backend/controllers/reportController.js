import Report from '../models/Report.js';
import User from '../models/User.js';
import { verifyParentChildAccess } from '../utils/parentAuth.js';

// @desc    Get reports based on role
// @route   GET /api/reports
export const getReports = async (req, res, next) => {
  try {
    const { studentId, class: className } = req.query;
    let query = {};

    if (req.user.role === 'admin' || req.user.role === 'teacher') {
      if (studentId) query.studentId = studentId;
      if (className) query.class = className;
    } else if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'parent') {
      let childIds = [];
      if (req.user.children && req.user.children.length > 0) {
        childIds = req.user.children.map(c => c.studentId).filter(Boolean);
      }
      const matching = await User.find({
        role: 'student',
        parentEmail: req.user.email.toLowerCase()
      }).select('_id');
      const allChildIds = [...childIds, ...matching.map(s => s._id)];

      if (studentId) {
        const isChild = allChildIds.some(id => id.toString() === studentId.toString());
        if (!isChild) {
          return res.status(403).json({ success: false, message: 'Access denied to reports for this student' });
        }
        query.studentId = studentId;
      } else {
        query.studentId = { $in: allChildIds };
      }
    }

    const reports = await Report.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/generate report card (Admin & Teachers only)
// @route   POST /api/reports
export const createReport = async (req, res, next) => {
  try {
    const { studentId, studentName, class: className, rollNumber, subjects, term, academicYear, teacherRemarks, attendancePercentage } = req.body;

    let totalMarks = 0;
    let maxTotal = 0;

    if (subjects && subjects.length > 0) {
      subjects.forEach(s => {
        totalMarks += Number(s.marks || 0);
        maxTotal += Number(s.maxMarks || 100);
      });
    }

    const percentage = maxTotal > 0 ? Number(((totalMarks / maxTotal) * 100).toFixed(1)) : 0;
    let overallGrade = 'F';
    if (percentage >= 90) overallGrade = 'A+';
    else if (percentage >= 80) overallGrade = 'A';
    else if (percentage >= 70) overallGrade = 'B';
    else if (percentage >= 60) overallGrade = 'C';
    else if (percentage >= 50) overallGrade = 'D';

    const report = await Report.create({
      studentId,
      studentName,
      class: className,
      rollNumber,
      academicYear: academicYear || '2024-2025',
      term: term || 'Term 1',
      subjects,
      totalMarks,
      percentage,
      overallGrade,
      teacherRemarks,
      attendancePercentage: attendancePercentage || 88
    });

    res.status(201).json({ success: true, message: 'Report card generated successfully', report });
  } catch (error) {
    next(error);
  }
};
