const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const Role = require('../models/roleModel');


/**
 * Authentication middleware to verify JWT tokens
 * and attach the user to the request object
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Find user by id
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    // Check if token is in the blacklist (for logged out tokens)
    // You would implement a token blacklist in a real application
    // const isBlacklisted = await BlacklistedToken.findOne({ token });
    // if (isBlacklisted) {
    //   return res.status(401).json({ 
    //     success: false, 
    //     message: 'Invalid token. Please log in again.' 
    //   });
    // }

    // Attach user to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please log in again.' 
      });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication.' 
    });
  }
};

/**
 * Authorization middleware to check if user has required role
 * @param {string[]} roles - Array of roles allowed to access the route
 * @returns {Function} Middleware function
 */
exports.authorize = (roles = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      // If no roles are required, just continue
      if (roles.length === 0) {
        return next();
      }

      // Convert string to array if only one role is passed
      if (typeof roles === 'string') {
        roles = [roles];
      }

      // Check if user has one of the required roles
      const userRole = req.user.role;
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have the required permissions.'
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during authorization.' 
      });
    }
  };
};

/**
 * Permission-based authorization middleware
 * Requires more complex role/permission model
 * @param {string[]} requiredPermissions - Array of permissions required to access the route
 * @returns {Function} Middleware function
 */
exports.hasPermission = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      // If no specific permissions required, continue
      if (requiredPermissions.length === 0) {
        return next();
      }

      // Convert string to array if only one permission is passed
      if (typeof requiredPermissions === 'string') {
        requiredPermissions = [requiredPermissions];
      }

      // Get user's role
      const userRole = await Role.findOne({ name: req.user.role });
      
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Invalid role configuration. Please contact an administrator.'
        });
      }

      // Admin bypass - admins have all permissions
      if (userRole.name === 'admin' || userRole.permissions.includes('all')) {
        return next();
      }

      // Check if user's role has all the required permissions
      const hasAllRequiredPermissions = requiredPermissions.every(permission => 
        userRole.permissions.includes(permission)
      );

      if (!hasAllRequiredPermissions) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have the required permissions.'
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during permission verification.' 
      });
    }
  };
};

/**
 * Check if user is the owner of a resource
 * @param {string} resourceModelName - Name of the mongoose model
 * @param {string} resourceIdParam - Name of the request parameter containing the resource ID
 * @param {string} userIdField - Field name in the resource that references the user
 * @returns {Function} Middleware function
 */
exports.isResourceOwner = (resourceModelName, resourceIdParam = 'id', userIdField = 'reportedBy') => {
  return async (req, res, next) => {
    try {
      // Get the resource ID from request params
      const resourceId = req.params[resourceIdParam];
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: `Resource ID not provided in request parameters.`
        });
      }

      // Get the Mongoose model
      const ResourceModel = require(`../models/${resourceModelName}`);
      
      // Find the resource
      const resource = await ResourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `${resourceModelName} not found.`
        });
      }

      // Check if user is the owner
      const isOwner = resource[userIdField] && 
                      resource[userIdField].toString() === req.user._id.toString();
      
      // Admin bypass - admins can access any resource
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this resource.'
        });
      }

      // Attach the resource to the request for later use
      req.resource = resource;
      
      next();
    } catch (error) {
      console.error('Resource ownership check error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during resource ownership verification.' 
      });
    }
  };
};