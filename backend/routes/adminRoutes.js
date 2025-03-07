const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Report = require('../models/Report');
const Category = require('../models/Category');
const Notification = require('../models/Notification');
const { check, validationResult } = require('express-validator');

// Apply admin middleware to all routes
router.use(auth);
router.use(admin);

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    // Get counts for key metrics
    const totalUsers = await User.countDocuments();
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const inProgressReports = await Report.countDocuments({ status: 'in-progress' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });
    
    // Get reports by category
    const reportsByCategory = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get recent activity
    const recentReports = await Report.find()
      .sort({ dateCreated: -1 })
      .limit(5)
      .populate('user', 'name');
    
    // Get top reporters (users with most reports)
    const topReporters = await Report.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Get user details for top reporters
    const topReportersWithDetails = await Promise.all(
      topReporters.map(async (reporter) => {
        const user = await User.findById(reporter._id).select('name email neighborhood');
        return {
          user,
          reportCount: reporter.count
        };
      })
    );
    
    // Reports created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const reportsLast30Days = await Report.aggregate([
      { 
        $match: { 
          dateCreated: { $gte: thirtyDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$dateCreated" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const stats = {
      totalUsers,
      totalReports,
      reportStatus: {
        pending: pendingReports,
        inProgress: inProgressReports,
        resolved: resolvedReports
      },
      reportsByCategory,
      recentReports,
      topReporters: topReportersWithDetails,
      reportsLast30Days
    };
    
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/users
// @desc    Get all users with pagination
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .select('-password')
      .sort({ dateJoined: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments();
    
    res.json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/users/search
// @desc    Search users
// @access  Private/Admin
router.get('/users/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { neighborhood: { $regex: query, $options: 'i' } }
      ]
    }).select('-password');
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/users/:userId
// @desc    Update user role or status
// @access  Private/Admin
router.put('/users/:userId', async (req, res) => {
  try {
    const { role, isActive } = req.body;
    
    // Build update object
    const updateObj = {};
    if (role) updateObj.role = role;
    if (isActive !== undefined) updateObj.isActive = isActive;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updateObj },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/admin/users/:userId
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:userId', async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Prevent deleting self
    if (req.user.id === req.params.userId) {
      return res.status(400).json({ msg: 'Cannot delete your own account' });
    }
    
    // Delete user's reports (or reassign them to admin)
    await Report.updateMany(
      { user: req.params.userId },
      { $set: { user: req.user.id } }
    );
    
    // Remove user
    await User.findByIdAndRemove(req.params.userId);
    
    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/reports
// @desc    Get all reports with filters and pagination
// @access  Private/Admin
router.get('/reports', async (req, res) => {
  try {
    const { status, category, neighborhood, priority, sortBy, sortOrder, page, limit } = req.query;
    
    // Build filter object
    const filterObj = {};
    if (status) filterObj.status = status;
    if (category) filterObj.category = category;
    if (neighborhood) filterObj.neighborhood = neighborhood;
    if (priority) filterObj.priority = priority;
    
    // Set up pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    // Set up sorting
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.dateCreated = -1; // Default sort by newest
    }
    
    // Get reports with filters, sorting, and pagination
    const reports = await Report.find(filterObj)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email');
    
    // Get total count for pagination
    const total = await Report.countDocuments(filterObj);
    
    res.json({
      reports,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/reports/:reportId
// @desc    Update report status, priority, or assignment
// @access  Private/Admin
router.put('/reports/:reportId', async (req, res) => {
  try {
    const { status, priority, assignedTo, adminComment } = req.body;
    
    // Find report
    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }
    
    // Update report fields
    if (status) report.status = status;
    if (priority) report.priority = priority;
    if (assignedTo) report.assignedTo = assignedTo;
    
    // Add admin comment if provided
    if (adminComment) {
      report.adminComments.push({
        user: req.user.id,
        text: adminComment,
        datePosted: Date.now()
      });
    }
    
    // Track status changes
    if (status && status !== report.status) {
      report.statusHistory.push({
        status,
        changedBy: req.user.id,
        dateChanged: Date.now()
      });
      
      // Create notification for the report owner
      await Notification.create({
        user: report.user,
        type: 'report_status_changed',
        message: `Your report "${report.title}" has been updated to status: ${status}`,
        relatedReport: report._id,
        isRead: false,
        dateCreated: Date.now()
      });
    }
    
    await report.save();
    
    // Populate user information
    await report.populate('user', 'name email').execPopulate();
    if (report.assignedTo) {
      await report.populate('assignedTo', 'name email').execPopulate();
    }
    
    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/admin/categories
// @desc    Create a new category
// @access  Private/Admin
router.post('/categories', [
  check('name', 'Category name is required').not().isEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { name, description, icon, color } = req.body;
    
    // Check if category already exists
    let category = await Category.findOne({ name });
    if (category) {
      return res.status(400).json({ msg: 'Category already exists' });
    }
    
    // Create new category
    category = new Category({
      name,
      description,
      icon,
      color,
      createdBy: req.user.id
    });
    
    await category.save();
    
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/categories
// @desc    Get all categories
// @access  Private/Admin
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/categories/:categoryId
// @desc    Update a category
// @access  Private/Admin
router.put('/categories/:categoryId', async (req, res) => {
  try {
    const { name, description, icon, color, isActive } = req.body;
    
    // Find category
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    // Update fields
    if (name) category.name = name;
    if (description) category.description = description;
    if (icon) category.icon = icon;
    if (color) category.color = color;
    if (isActive !== undefined) category.isActive = isActive;
    
    await category.save();
    
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/admin/categories/:categoryId
// @desc    Delete a category
// @access  Private/Admin
router.delete('/categories/:categoryId', async (req, res) => {
  try {
    // Find category
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    // Check if category is in use
    const reportsUsingCategory = await Report.countDocuments({ category: category.name });
    if (reportsUsingCategory > 0) {
      return res.status(400).json({ 
        msg: `Cannot delete category. It is used by ${reportsUsingCategory} reports.`
      });
    }
    
    // Delete category
    await Category.findByIdAndRemove(req.params.categoryId);
    
    res.json({ msg: 'Category deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/admin/broadcast
// @desc    Send a broadcast notification to all users or filtered group
// @access  Private/Admin
router.post('/broadcast', [
  check('message', 'Message is required').not().isEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { message, title, userFilter, neighborhood, sendEmail } = req.body;
    
    // Build query for target users
    let query = {};
    if (userFilter === 'active') query.isActive = true;
    if (neighborhood) query.neighborhood = neighborhood;
    
    // Get target users
    const users = await User.find(query).select('_id');
    
    // Create notifications for each user
    const notifications = users.map(user => ({
      user: user._id,
      type: 'admin_broadcast',
      title: title || 'Admin Announcement',
      message,
      isRead: false,
      dateCreated: Date.now(),
      sentBy: req.user.id
    }));
    
    await Notification.insertMany(notifications);
    
    // TODO: If sendEmail is true, send email notifications
    // This would require integration with an email service
    
    res.json({ 
      msg: 'Broadcast sent successfully', 
      sentTo: users.length 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/flagged-content
// @desc    Get all flagged content (reports and comments)
// @access  Private/Admin
router.get('/flagged-content', async (req, res) => {
  try {
    // Get flagged reports
    const flaggedReports = await Report.find({ 'flags.0': { $exists: true } })
      .populate('user', 'name email');
    
    // Get reports with flagged comments
    const reportsWithFlaggedComments = await Report.find({ 'comments.flags.0': { $exists: true } })
      .populate('user', 'name email');
    
    // Extract flagged comments
    const flaggedComments = [];
    reportsWithFlaggedComments.forEach(report => {
      const filteredComments = report.comments.filter(
        comment => comment.flags && comment.flags.length > 0
      );
      
      filteredComments.forEach(comment => {
        flaggedComments.push({
          reportId: report._id,
          reportTitle: report.title,
          comment
        });
      });
    });
    
    res.json({
      flaggedReports,
      flaggedComments
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/system-settings
// @desc    Update system settings
// @access  Private/Admin
router.put('/system-settings', async (req, res) => {
  try {
    const { 
      siteName,
      welcomeMessage,
      requiredPointsForBadges,
      maximumImageSize,
      allowAnonymousReports,
      enableNotifications,
      maintenanceMode
    } = req.body;
    
    // This would typically update a settings document in your database
    // For this example, we'll just return the settings that would be updated
    
    const settings = {
      siteName,
      welcomeMessage,
      requiredPointsForBadges,
      maximumImageSize,
      allowAnonymousReports,
      enableNotifications,
      maintenanceMode,
      lastUpdated: Date.now(),
      updatedBy: req.user.id
    };
    
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/audit-log
// @desc    Get system audit logs
// @access  Private/Admin
router.get('/audit-log', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // This would typically query an audit log collection
    // For this example, we'll return mock data
    
    const auditLogs = [
      {
        _id: '1',
        action: 'USER_ROLE_CHANGE',
        performedBy: req.user.id,
        details: 'Changed user role from citizen to moderator',
        targetUser: 'user123',
        timestamp: new Date()
      },
      {
        _id: '2',
        action: 'REPORT_STATUS_CHANGE',
        performedBy: req.user.id,
        details: 'Changed report status from pending to in-progress',
        targetReport: 'report456',
        timestamp: new Date()
      }
    ];
    
    res.json({
      logs: auditLogs,
      pagination: {
        total: 2,
        page,
        pages: 1
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;