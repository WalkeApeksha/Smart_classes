import User from '../models/User.js';

/**
 * Helper to verify if a parent has authorized access to a specific student's records
 * @param {Object} parentUser - The authenticated parent User document
 * @param {string|ObjectId} studentId - The target student's MongoDB ID
 * @returns {Promise<boolean>} - True if verified, false otherwise
 */
export const verifyParentChildAccess = async (parentUser, studentId) => {
  if (!parentUser || parentUser.role !== 'parent') {
    return false;
  }

  const sIdStr = studentId.toString();

  // 1. Check direct linked children in parent document
  if (parentUser.children && parentUser.children.length > 0) {
    const isDirectChild = parentUser.children.some(
      c => c.studentId && c.studentId.toString() === sIdStr
    );
    if (isDirectChild) return true;
  }

  // 2. Check student record matching parent's email
  const student = await User.findOne({
    _id: studentId,
    role: 'student',
    parentEmail: parentUser.email.toLowerCase()
  });

  return Boolean(student);
};

export default verifyParentChildAccess;
