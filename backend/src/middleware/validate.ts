import { body, query, param } from 'express-validator';

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const createRecordValidation = [
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be "income" or "expense"'),
  body('category')
    .notEmpty()
    .trim()
    .withMessage('Category is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date in ISO 8601 format is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be 500 characters or fewer'),
  body('status')
    .optional()
    .isIn(['verified', 'pending', 'cleared'])
    .withMessage('Status must be "verified", "pending", or "cleared"'),
];

export const updateRecordValidation = [
  param('id').isInt({ gt: 0 }).withMessage('Valid record ID is required'),
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be "income" or "expense"'),
  body('category')
    .optional()
    .notEmpty()
    .trim()
    .withMessage('Category cannot be empty'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Valid date required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be 500 characters or fewer'),
  body('status')
    .optional()
    .isIn(['verified', 'pending', 'cleared'])
    .withMessage('Status must be "verified", "pending", or "cleared"'),
];

export const recordFiltersValidation = [
  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Filter type must be "income" or "expense"'),
  query('category')
    .optional()
    .trim(),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Valid start date required'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('Valid end date required'),
  query('page')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ gt: 0, lt: 101 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim(),
];

export const createUserValidation = [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['admin', 'analyst', 'viewer'])
    .withMessage('Role must be "admin", "analyst", or "viewer"'),
];

export const updateUserValidation = [
  param('id').isInt({ gt: 0 }).withMessage('Valid user ID is required'),
  body('name').optional().notEmpty().trim().withMessage('Name cannot be empty'),
  body('role')
    .optional()
    .isIn(['admin', 'analyst', 'viewer'])
    .withMessage('Role must be "admin", "analyst", or "viewer"'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be "active" or "inactive"'),
];
