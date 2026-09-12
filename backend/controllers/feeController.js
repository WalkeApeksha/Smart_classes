import FeeModel from '../models/Fee.js';
import User from '../models/User.js';
import { verifyParentChildAccess } from '../utils/parentAuth.js';

// @desc    Get fees based on user role and permissions
// @route   GET /api/fees
export const getAllFees = async (req, res, next) => {
  try {
    const { status, class: className, studentId } = req.query;
    let query = {};

    if (req.user.role === 'admin') {
      // Admins have full access across the institution
      if (status) query.status = status;
      if (className) query.class = className;
      if (studentId) query.studentId = studentId;
    } else if (req.user.role === 'teacher') {
      // Teachers only see their assigned class fee summary if class specified
      if (className) {
        query.class = className;
      } else if (req.user.assignedClasses && req.user.assignedClasses.length > 0) {
        query.class = { $in: req.user.assignedClasses };
      }
      if (status) query.status = status;
    } else if (req.user.role === 'student') {
      // If student attempted to query another student's ID explicitly
      if (studentId && studentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Students can only view their own fee information'
        });
      }
      // Students can ONLY view their own fees
      query.studentId = req.user._id;
      if (status) query.status = status;
    } else if (req.user.role === 'parent') {
      // Parents can ONLY view fees of their linked children
      let childIds = [];
      if (req.user.children && req.user.children.length > 0) {
        childIds = req.user.children.map(c => c.studentId).filter(Boolean);
      }
      const matchingStudents = await User.find({
        role: 'student',
        parentEmail: req.user.email.toLowerCase()
      }).select('_id');
      
      const allChildIds = [...childIds, ...matchingStudents.map(s => s._id)];

      if (studentId) {
        // If parent requested a specific child ID, verify access
        const isChild = allChildIds.some(id => id.toString() === studentId.toString());
        if (!isChild) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You cannot view fees for an unlinked student'
          });
        }
        query.studentId = studentId;
      } else {
        query.studentId = { $in: allChildIds };
      }

      if (status) query.status = status;
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized role' });
    }

    const fees = await FeeModel.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: fees.length, fees });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single fee invoice by ID
// @route   GET /api/fees/:id
export const getFeeById = async (req, res, next) => {
  try {
    const fee = await FeeModel.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }

    // Role-based authorization
    if (req.user.role === 'student') {
      if (fee.studentId && fee.studentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied: You cannot view this fee invoice' });
      }
    } else if (req.user.role === 'parent') {
      if (fee.studentId) {
        const isAuthorized = await verifyParentChildAccess(req.user, fee.studentId);
        if (!isAuthorized) {
          return res.status(403).json({ success: false, message: 'Access denied: You cannot view this fee invoice' });
        }
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this fee invoice' });
    }

    res.status(200).json({ success: true, fee });
  } catch (error) {
    next(error);
  }
};

// @desc    Create fee invoice (Admin only)
// @route   POST /api/fees
export const createFee = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only administrators can create fee invoices' });
    }
    const fee = await FeeModel.create(req.body);
    res.status(201).json({ success: true, message: 'Fee invoice created successfully', fee });
  } catch (error) {
    next(error);
  }
};

// @desc    Update fee invoice (Admin only)
// @route   PUT /api/fees/:id
export const updateFee = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only administrators can modify fee invoices' });
    }
    const fee = await FeeModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }
    res.status(200).json({ success: true, message: 'Fee invoice updated', fee });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete fee invoice (Admin only)
// @route   DELETE /api/fees/:id
export const deleteFee = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only administrators can delete fee invoices' });
    }
    const fee = await FeeModel.findByIdAndDelete(req.params.id);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }
    res.status(200).json({ success: true, message: 'Fee invoice deleted' });
  } catch (error) {
    next(error);
  }
};
