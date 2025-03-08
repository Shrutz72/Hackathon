/**
 * Middleware to protect admin routes in the CivicConnect platform
 * This middleware verifies if the current user has admin privileges
 * before allowing access to admin-only sections of the dashboard
 */

const adminMiddleware = (req, res, next) => {
  // Check if user exists in the session
  if (!req.session || !req.session.user) {
    return res.status(401).redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
  }

  // Check if the user has admin role
  if (!req.session.user.roles || !req.session.user.roles.includes('admin')) {
    // Log unauthorized access attempt
    console.warn(`Unauthorized admin access attempt by user: ${req.session.user.id} (${req.session.user.email}) to ${req.originalUrl}`);
    
    // Redirect to unauthorized page or dashboard with error message
    return res.status(403).redirect('/dashboard?error=unauthorized_access');
  }

  // User has admin privileges, proceed to the next middleware or route handler
  console.info(`Admin access granted to ${req.session.user.email} for route: ${req.originalUrl}`);
  next();
};

module.exports = adminMiddleware;

// Example usage in routes file:
// const adminMiddleware = require('../middleware/admin');
// 
// // Protect admin routes
// router.get('/admin/users', adminMiddleware, adminController.listUsers);
// router.post('/admin/settings', adminMiddleware, adminController.updateSettings);