const { body } = require('express-validator');

exports.createExpenseValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['flights', 'hotels', 'food', 'shopping', 'fuel', 'transport', 'activities', 'miscellaneous'])
    .withMessage('Invalid category'),
  body('paidBy')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('splitType')
    .optional()
    .isIn(['equal', 'percentage', 'custom'])
    .withMessage('Invalid split type'),
];
