import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Homework from '../models/Homework.js';
import Test from '../models/Test.js';
import Fee from '../models/Fee.js';
import Announcement from '../models/Announcement.js';
import Report from '../models/Report.js';
import { generateUniqueId } from '../utils/generateId.js';

// @desc    Get all users with optional role & search filtering
// @route   GET /api/admin/users
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, class: className } = req.query;
    let query = {};

    if (role && role !== 'all') {
      query.role = role;
    }
    if (className) {
      query.class = className;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { uniqueId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/admin/users
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, subject, assignedClasses, rollNumber, class: className, parentEmail, phone, address } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const uniqueId = generateUniqueId(role);
    const user = await User.create({
      uniqueId,
      name,
      email: email.toLowerCase(),
      password: password || 'Kashvi@123',
      role: role || 'student',
      subject,
      assignedClasses,
      rollNumber,
      class: className,
      parentEmail,
      phone,
      address
    });

    res.status(201).json({ success: true, message: 'User created successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
export const updateUser = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (Active/Inactive)
// @route   PUT /api/admin/users/:id/toggle-status
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: `User status changed to ${user.isActive ? 'Active' : 'Inactive'}`, isActive: user.isActive });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset user password by admin
// @route   POST /api/admin/users/:id/reset-password
export const resetUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword || 'Kashvi@123';
    user.passwordChangedAt = new Date();
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully for user' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete admin dashboard analytics & KPI cards
// @route   GET /api/admin/dashboard-stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalStudents, totalTeachers, totalParents, totalAnnouncements, recentFees, recentAttendance] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'parent' }),
      Announcement.countDocuments({ isPublished: true }),
      Fee.find().sort({ createdAt: -1 }).limit(5),
      Attendance.find().sort({ date: -1 }).limit(10)
    ]);

    const feeAgg = await Fee.aggregate([
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    let totalCollected = 0;
    let pendingFee = 0;
    feeAgg.forEach(f => {
      if (f._id === 'paid') totalCollected = f.totalAmount;
      if (f._id === 'pending' || f._id === 'overdue') pendingFee += f.totalAmount;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalParents,
        totalAnnouncements,
        totalCollected,
        pendingFee,
        recentFees,
        recentAttendance
      }
    });
  } catch (error) {
    next(error);
  }
};

// Announcements CRUD for Admin
export const createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.create(req.body);
    res.status(201).json({ success: true, announcement });
  } catch (error) {
    next(error);
  }
};

export const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    next(error);
  }
};
