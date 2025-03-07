// middleware/errorHandler.js

/**
 * Custom error handler middleware for Express applications
 * Handles various types of errors including Mongoose validation errors,
 * cast errors, duplicate key errors, and general application errors
 */
const errorHandler = (err, req, res, next) => {
    console.log(err.stack);
    
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;
    let errors = {};
  
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      statusCode = 400;
      
      // Extract validation error messages
      Object.keys(err.errors).forEach(key => {
        errors[key] = err.errors[key].message;
      });
      
      message = 'Validation failed';
    }
    
    // Handle Mongoose cast errors (e.g., invalid ObjectId)
    else if (err.name === 'CastError') {
      statusCode = 400;
      message = `Invalid ${err.path}: ${err.value}`;
    }
    
    // Handle Mongoose duplicate key errors
    else if (err.code === 11000) {
      statusCode = 400;
      const field = Object.keys(err.keyValue)[0];
      message = `Duplicate value for ${field}. This ${field} already exists.`;
    }
    
    // Handle JWT errors
    else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token. Please log in again.';
    }
    
    // Handle token expiration
    else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Your token has expired. Please log in again.';
    }
  
    res.status(statusCode).json({
      success: false,
      message,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
  
  module.exports = errorHandler;