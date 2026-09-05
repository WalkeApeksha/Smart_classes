import { body, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({ field: e.path, msg: e.msg }))
    });
  }
  next();
};

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').optional().isIn(['admin', 'teacher', 'student', 'parent']).withMessage('Invalid role specified')
];

export const registerValidation = [
  body('name').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['admin', 'teacher', 'student', 'parent']).withMessage('Role must be admin, teacher, student, or parent')
];
