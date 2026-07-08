const { body } = require('express-validator');

exports.createTripValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Trip title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination is required'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format'),
  body('budget')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
  body('numberOfTravelers')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Number of travelers must be at least 1'),
];

exports.updateTripValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('budget')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
  body('numberOfTravelers')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Number of travelers must be at least 1'),
];
