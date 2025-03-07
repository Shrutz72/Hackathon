const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Middleware to check validation results
 * @returns {Function} Middleware function
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        param: err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Validation rules for user registration
 */
exports.registerRules = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('phoneNumber')
    .optional()
    .trim()
    .isMobilePhone().withMessage('Please provide a valid phone number')
];

/**
 * Validation rules for user login
 */
exports.loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
];

/**
 * Validation rules for issue reporting
 */
exports.reportIssueRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Issue title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Issue description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .custom(async (value) => {
      try {
        // Check if category exists in the database
        const Category = require('../models/Category');
        const category = await Category.findById(value);
        
        if (!category) {
          throw new Error('Invalid category');
        }
        
        return true;
      } catch (error) {
        throw new Error('Invalid category ID');
      }
    }),
  
  body('location.coordinates')
    .isArray().withMessage('Coordinates must be an array')
    .custom((value) => {
      if (value.length !== 2) {
        throw new Error('Coordinates must have exactly longitude and latitude values');
      }
      
      const [longitude, latitude] = value;
      
      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      
      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      
      return true;
    }),
  
  body('location.type')
    .trim()
    .equals('Point').withMessage('Location type must be "Point"'),
  
  body('neighbourhood')
    .optional()
    .custom(async (value) => {
      try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Invalid neighbourhood ID format');
        }
        
        // Check if neighbourhood exists
        const Neighbourhood = require('../models/Neighbourhood');
        const neighbourhood = await Neighbourhood.findById(value);
        
        if (!neighbourhood) {
          throw new Error('Neighbourhood not found');
        }
        
        return true;
      } catch (error) {
        throw new Error(error.message || 'Invalid neighbourhood ID');
      }
    }),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((value) => {
      if (value.some(tag => typeof tag !== 'string')) {
        throw new Error('All tags must be strings');
      }
      
      if (value.some(tag => tag.length < 2 || tag.length > 20)) {
        throw new Error('Each tag must be between 2 and 20 characters');
      }
      
      return true;
    }),
  
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Urgency must be low, medium, high, or critical')
];

/**
 * Validation rules for comments
 */
exports.commentRules = [
  body('text')
    .trim()
    .notEmpty().withMessage('Comment text is required')
    .isLength({ min: 2, max: 500 }).withMessage('Comment must be between 2 and 500 characters'),
  
  param('issueId')
    .custom(async (value) => {
      try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Invalid issue ID format');
        }
        
        // Check if issue exists
        const Issue = require('../models/Issue');
        const issue = await Issue.findById(value);
        
        if (!issue) {
          throw new Error('Issue not found');
        }
        
        return true;
      } catch (error) {
        throw new Error(error.message || 'Invalid issue ID');
      }
    })
];

/**
 * Validation rules for updating issue status
 */
exports.updateStatusRules = [
  param('issueId')
    .custom(async (value) => {
      try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Invalid issue ID format');
        }
        
        // Check if issue exists
        const Issue = require('../models/Issue');
        const issue = await Issue.findById(value);
        
        if (!issue) {
          throw new Error('Issue not found');
        }
        
        return true;
      } catch (error) {
        throw new Error(error.message || 'Invalid issue ID');
      }
    }),
  
  body('status')
    .trim()
    .notEmpty().withMessage('Status is required')
    .isIn(['open', 'in-progress', 'resolved', 'closed', 'reopened']).withMessage('Status must be open, in-progress, resolved, closed, or reopened'),
  
  body('statusNote')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Status note must not exceed 500 characters')
];

/**
 * Validation rules for searching issues
 */
exports.searchIssueRules = [
  query('category')
    .optional()
    .custom(async (value) => {
      try {
        // Check if category exists
        const Category = require('../models/Category');
        const category = await Category.findById(value);
        
        if (!category) {
          throw new Error('Invalid category');
        }
        
        return true;
      } catch (error) {
        throw new Error('Invalid category ID');
      }
    }),
  
  query('status')
    .optional()
    .isIn(['open', 'in-progress', 'resolved', 'closed', 'reopened']).withMessage('Status must be open, in-progress, resolved, closed, or reopened'),
  
  query('neighbourhood')
    .optional()
    .custom(async (value) => {
      try {
        // Check if neighbourhood exists
        const Neighbourhood = require('../models/Neighbourhood');
        const neighbourhood = await Neighbourhood.findById(value);
        
        if (!neighbourhood) {
          throw new Error('Neighbourhood not found');
        }
        
        return true;
      } catch (error) {
        throw new Error('Invalid neighbourhood ID');
      }
    }),
  
  query('nearMe')
    .optional()
    .isBoolean().withMessage('nearMe parameter must be a boolean'),
  
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  
  query('radius')
    .optional()
    .isFloat({ min: 0, max: 50 }).withMessage('Radius must be between 0 and 50 kilometers'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be at least 1')
];

/**
 * Validation for valid MongoDB ObjectId
 */
exports.validateObjectId = (paramName) => {
  return param(paramName)
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error(`Invalid ${paramName} format`);
      }
      return true;
    });
};