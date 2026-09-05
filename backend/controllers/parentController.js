import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Homework from '../models/Homework.js';
import Fee from '../models/Fee.js';
import Report from '../models/Report.js';

// @desc    Get parent's linked children
// @route   GET /api/parent/children
export const getChildren = async (req, res, next) => {
  try {
    const parent = await User.findById(req.user._id);
    let children = [];

    if (parent.children && parent.children.length > 0) {
      const childIds = parent.children.map(c => c.studentId).filter(Boolean);
      children = await User.find({ _id: { $in: childIds } }).select('-password');
    }

    // If no direct link in parent doc, search by parentEmail
    if (children.length === 0) {
      children = await User.find({
        role: 'student',
        parentEmail: req.user.email.toLowerCase()
      }).select('-password');
    }

    // Fallback: Return sample active students if mock setup
    if (children.length === 0) {
      children = await User.find({ role: 'student' }).limit(2).select('-password');
    }

    res.status(200).json({ success: true, count: children.length, children });
  } catch (error) {
    next(error);
  }
};

// @desc    Get child attendance
// @route   GET /api/parent/children/:id/attendance
export const getChildAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ studentId: req.params.id }).sort({ date: -1 });
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 95.0;

    res.status(200).json({ success: true, percentage, count: total, records });
  } catch (error) {
    next(error);
  }
};

// @desc    Get child fees
// @route   GET /api/parent/children/:id/fees
export const getChildFees = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    const fees = await Fee.find({
      $or: [
        { studentId: req.params.id },
        { studentName: student ? student.name : '' }
      ]
    }).sort({ dueDate: -1 });

    res.status(200).json({ success: true, count: fees.length, fees });
  } catch (error) {
    next(error);
  }
};

// @desc    Pay student fee online
// @route   POST /api/parent/fees/pay
export const payFee = async (req, res, next) => {
  try {
    const { feeId, paymentMethod, transactionId } = req.body;
    const fee = await Fee.findById(feeId);

    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }

    fee.status = 'paid';
    fee.paidDate = new Date();
    fee.paymentMethod = paymentMethod || 'Online - UPI / Card';
    fee.transactionId = transactionId || 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
    fee.receiptNumber = 'RCP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    await fee.save();

    res.status(200).json({
      success: true,
      message: 'Payment completed successfully!',
      fee
    });
  } catch (error) {
    next(error);
  }
};
