const Issue = require('../models/issueModel');
const User = require('../models/userModel');
const Comment = require('../models/commentModel');
const Category = require('../models/categoryModel');
const Neighbourhood = require('../models/neighbourhoodModel');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const notificationService = require('../services/notificationService');
const assignmentService = require('../services/assignmentService');
// Helper function to handle errors
const handleError = (res, error) => {
  console.error('Error:', error);
  return res.status(500).json({
    success: false,
    message: 'An error occurred',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
  });
};

// Get all issues with filtering, sorting, and pagination
exports.getAllIssues = async (req, res) => {
  try {
    const {
      status,
      category,
      neighbourhood,
      priority,
      reportedBy,
      assignedTo,
      startDate,
      endDate,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
      search
    } = req.query;

    // Build query
    const query = {};

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (reportedBy) query.reportedBy = reportedBy;
    if (assignedTo) query.assignedTo = assignedTo;

    // Filter by neighbourhood
    if (neighbourhood) {
      const hood = await Neighbourhood.findById(neighbourhood);
      if (hood) {
        query['location.coordinates'] = {
          $geoWithin: {
            $geometry: hood.geometry
          }
        };
      }
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Count total documents for pagination
    const total = await Issue.countDocuments(query);

    // Calculate pagination values
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Get sorted data
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    const issues = await Issue.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reportedBy', 'username profileImage')
      .populate('category', 'name icon color')
      .populate('assignedTo', 'username profileImage')
      .lean();

    // Return results with pagination info
    return res.status(200).json({
      success: true,
      count: issues.length,
      pagination: {
        total,
        page: parseInt(page),
        totalPages,
        limit: parseInt(limit)
      },
      data: issues
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get issues within a specific radius of coordinates
exports.getIssuesNearby = async (req, res) => {
  try {
    const { longitude, latitude, radius = 1, unit = 'km' } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude coordinates'
      });
    }

    // Convert radius to meters (MongoDB uses meters for $maxDistance)
    const radiusInMeters = unit === 'km' ? radius * 1000 : radius * 1609.34;

    const issues = await Issue.find({
      'location.coordinates': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radiusInMeters
        }
      }
    })
    .populate('reportedBy', 'username profileImage')
    .populate('category', 'name icon color')
    .lean();

    return res.status(200).json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get a single issue by ID
exports.getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID format'
      });
    }

    const issue = await Issue.findById(id)
      .populate('reportedBy', 'username profileImage firstName lastName reputation')
      .populate('category', 'name icon color description customFields')
      .populate('assignedTo', 'username profileImage firstName lastName')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username profileImage firstName lastName reputation'
        },
        options: { sort: { createdAt: 1 } }
      })
      .populate('upvotes.user', 'username profileImage')
      .populate('followers', 'username profileImage')
      .lean();

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Increment view count
    await Issue.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    // Find the neighbourhood
    if (issue.location && issue.location.coordinates) {
      const neighbourhood = await Neighbourhood.findOne({
        geometry: {
          $geoIntersects: {
            $geometry: {
              type: 'Point',
              coordinates: issue.location.coordinates
            }
          }
        }
      }).select('name _id');

      if (neighbourhood) {
        issue.neighbourhood = neighbourhood;
      }
    }

    // Add similar issues
    const similarIssues = await Issue.find({
      _id: { $ne: id },
      category: issue.category._id,
      status: { $ne: 'resolved' }
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title status priority createdAt location.address')
    .lean();

    issue.similarIssues = similarIssues;

    return res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Create a new issue
exports.createIssue = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      category,
      location,
      customFields,
      priority = 'medium'
    } = req.body;

    // Verify user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Process uploaded files
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          fileUrl: `/uploads/issues/${file.filename}`,
          fileType: file.mimetype.startsWith('image/') ? 'image' : 'document',
          fileName: file.originalname,
          fileSize: file.size
        });
      });
    }

    // Create the issue
    const newIssue = new Issue({
      title,
      description,
      category,
      reportedBy: req.user.id,
      location,
      priority,
      attachments,
      customFields: customFields || {},
      followers: [req.user.id] // Automatically follow your own issue
    });

    // Assign based on category and location if available
    const assignmentResult = await assignmentService.assignIssue(newIssue, categoryDoc);
    if (assignmentResult.assigned) {
      newIssue.assignedTo = assignmentResult.assignedTo;
      newIssue.assignmentNote = assignmentResult.note;
    }

    // Save the issue
    const savedIssue = await newIssue.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.issuesReported': 1 }
    });

    // Update category stats
    await categoryDoc.updateStats(1, 0);

    // Find neighbourhood and update stats
    if (location && location.coordinates) {
      const neighbourhood = await Neighbourhood.findOne({
        geometry: {
          $geoIntersects: {
            $geometry: {
              type: 'Point',
              coordinates: location.coordinates
            }
          }
        }
      });

      if (neighbourhood) {
        await neighbourhood.updateIssueStats(1, 0);
      }
    }

    // Send notifications
    await notificationService.issueCreated(savedIssue);

    // Return the created issue
    const populatedIssue = await Issue.findById(savedIssue._id)
      .populate('reportedBy', 'username profileImage')
      .populate('category', 'name icon color')
      .populate('assignedTo', 'username profileImage')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: populatedIssue
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Update an issue
exports.updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID format'
      });
    }

    // Find the issue
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check permissions (admin, issue owner, or assigned user)
    if (
      req.user.role !== 'admin' &&
      issue.reportedBy.toString() !== req.user.id &&
      (!issue.assignedTo || issue.assignedTo.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this issue'
      });
    }

    // Handle status changes
    const oldStatus = issue.status;
    const newStatus = updateData.status;

    if (newStatus && oldStatus !== newStatus) {
      // Add status history
      issue.statusHistory.push({
        status: newStatus,
        changedBy: req.user.id,
        note: updateData.statusNote || `Status changed from ${oldStatus} to ${newStatus}`
      });

      // Update category and neighbourhood stats
      if (newStatus === 'resolved' && oldStatus !== 'resolved') {
        const category = await Category.findById(issue.category);
        if (category) {
          // Calculate resolution time in hours
          const createdDate = new Date(issue.createdAt);
          const resolvedDate = new Date();
          const resolutionTime = (resolvedDate - createdDate) / (1000 * 60 * 60); // Hours
          
          await category.updateStats(-1, 1, resolutionTime);
        }

        // Update neighbourhood stats
        if (issue.location && issue.location.coordinates) {
          const neighbourhood = await Neighbourhood.findOne({
            geometry: {
              $geoIntersects: {
                $geometry: {
                  type: 'Point',
                  coordinates: issue.location.coordinates
                }
              }
            }
          });

          if (neighbourhood) {
            await neighbourhood.updateIssueStats(-1, 1);
          }
        }

        // Update user stats if they were assigned
        if (issue.assignedTo) {
          await User.findByIdAndUpdate(issue.assignedTo, {
            $inc: { 'stats.issuesResolved': 1 }
          });
        }

        // Set resolved date
        issue.resolvedAt = new Date();
      } else if (oldStatus === 'resolved' && newStatus !== 'resolved') {
        // Issue was reopened
        const category = await Category.findById(issue.category);
        if (category) {
          await category.updateStats(1, -1);
        }

        // Update neighbourhood stats
        if (issue.location && issue.location.coordinates) {
          const neighbourhood = await Neighbourhood.findOne({
            geometry: {
              $geoIntersects: {
                $geometry: {
                  type: 'Point',
                  coordinates: issue.location.coordinates
                }
              }
            }
          });

          if (neighbourhood) {
            await neighbourhood.updateIssueStats(1, -1);
          }
        }

        // Remove resolved date
        issue.resolvedAt = null;
      }
    }

    // Handle assignment changes
    if (updateData.assignedTo && (!issue.assignedTo || issue.assignedTo.toString() !== updateData.assignedTo)) {
      issue.assignmentHistory.push({
        assignedTo: updateData.assignedTo,
        assignedBy: req.user.id,
        note: updateData.assignmentNote || 'Manually assigned'
      });
      
      // Send notification to newly assigned user
      await notificationService.issueAssigned(issue, updateData.assignedTo);
    }

    // Process new attachments
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        issue.attachments.push({
          fileUrl: `/uploads/issues/${file.filename}`,
          fileType: file.mimetype.startsWith('image/') ? 'image' : 'document',
          fileName: file.originalname,
          fileSize: file.size,
          uploadedBy: req.user.id
        });
      });
    }

    // Remove attachments if requested
    if (updateData.removeAttachments && updateData.removeAttachments.length > 0) {
      // Get attachments to remove
      const attachmentsToRemove = issue.attachments.filter(att => 
        updateData.removeAttachments.includes(att._id.toString())
      );
      
      // Delete files from disk
      attachmentsToRemove.forEach(att => {
        const filePath = path.join(__dirname, '..', 'public', att.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      
      // Update attachments array
      issue.attachments = issue.attachments.filter(att => 
        !updateData.removeAttachments.includes(att._id.toString())
      );
    }

    // Update the fields (excluding special fields handled above)
    const allowedUpdates = [
      'title', 'description', 'priority', 'category', 'location', 
      'customFields', 'status', 'assignedTo', 'tags'
    ];
    
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        issue[field] = updateData[field];
      }
    });

    // Save the updated issue
    issue.updatedAt = new Date();
    const updatedIssue = await issue.save();

    // Send notifications for status changes
    if (newStatus && oldStatus !== newStatus) {
      await notificationService.issueStatusChanged(updatedIssue, oldStatus, newStatus);
    }

    return res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: updatedIssue
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Delete an issue
exports.deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID format'
      });
    }

    // Find the issue
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check permissions (only admin or issue owner can delete)
    if (req.user.role !== 'admin' && issue.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this issue'
      });
    }

    // Delete attachments from disk
    if (issue.attachments && issue.attachments.length > 0) {
      issue.attachments.forEach(att => {
        const filePath = path.join(__dirname, '..', 'public', att.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // Delete related comments
    await Comment.deleteMany({ issue: id });

    // Update category stats if issue is open
    if (issue.status !== 'resolved') {
      const category = await Category.findById(issue.category);
      if (category) {
        await category.updateStats(-1, 0);
      }
    }

    // Update user stats
    await User.findByIdAndUpdate(issue.reportedBy, {
      $inc: { 'stats.issuesReported': -1 }
    });

    // Delete the issue
    await Issue.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Upvote an issue
exports.upvoteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID format'
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if already upvoted
    const hasUpvoted = issue.upvotes.some(upvote => upvote.user.toString() === userId);
    
    if (hasUpvoted) {
      // Remove upvote (toggle behavior)
      issue.upvotes = issue.upvotes.filter(upvote => upvote.user.toString() !== userId);
      
      // Decrease reporter's reputation
      await User.findByIdAndUpdate(issue.reportedBy, {
        $inc: { reputation: -1 }
      });
    } else {
      // Add upvote
      issue.upvotes.push({
        user: userId,
        createdAt: new Date()
      });
      
      // Increase reporter's reputation
      await User.findByIdAndUpdate(issue.reportedBy, {
        $inc: { reputation: 1, 'stats.upvotesReceived': 1 }
      });
      
      // Send notification to issue reporter
      if (issue.reportedBy.toString() !== userId) {
        await notificationService.issueUpvoted(issue, userId);
      }
    }

    await issue.save();

    return res.status(200).json({
      success: true,
      message: hasUpvoted ? 'Upvote removed' : 'Issue upvoted successfully',
      upvoteCount: issue.upvotes.length,
      hasUpvoted: !hasUpvoted
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Follow an issue
exports.followIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID format'
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if already following
    const isFollowing = issue.followers.some(followerId => followerId.toString() === userId);
    
    if (isFollowing) {
      // Unfollow
      issue.followers = issue.followers.filter(followerId => followerId.toString() !== userId);
    } else {
      // Follow
      issue.followers.push(userId);
    }

    await issue.save();

    return res.status(200).json({
      success: true,
      message: isFollowing ? 'You are no longer following this issue' : 'You are now following this issue',
      isFollowing: !isFollowing,
      followerCount: issue.followers.length
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Add a comment to an issue
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parentComment } = req.body;
    const userId = req.user.id;

    // Validate
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID format'
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Create a new comment
    const newComment = new Comment({
      content,
      author: userId,
      issue: id,
      parentComment: parentComment || null
    });

    // Process attachments if any
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        newComment.attachments.push({
          fileUrl: `/uploads/comments/${file.filename}`,
          fileType: file.mimetype.startsWith('image/') ? 'image' : 'document',
          fileName: file.originalname,
          fileSize: file.size
        });
      });
    }

    // Check if this comment is a solution
    const isSolution = req.body.isSolution === 'true';
    newComment.isSolution = isSolution;

    // Save the comment
    const savedComment = await newComment.save();

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.commentsPosted': 1 }
    });

    // If marked as solution, update the issue
    if (isSolution) {
      issue.hasSolution = true;
      await issue.save();
      
      // Award reputation to comment author
      await User.findByIdAndUpdate(userId, {
        $inc: { reputation: 5, 'stats.solutionsProposed': 1 }
      });
    }

    // Send notifications to issue followers
    await notificationService.newComment(issue, savedComment);

    // Return the populated comment
    const populatedComment = await Comment.findById(savedComment._id)
      .populate('author', 'username profileImage firstName lastName reputation')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: populatedComment
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get issue statistics
exports.getIssueStatistics = async (req, res) => {
  try {
    const { timeframe = 'month', category, neighbourhood } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    // Set date range based on timeframe
    if (timeframe === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (timeframe === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { createdAt: { $gte: monthAgo } };
    } else if (timeframe === 'year') {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      dateFilter = { createdAt: { $gte: yearAgo } };
    }
    
    // Add category filter if provided
    const query = { ...dateFilter };
    if (category) {
      query.category = mongoose.Types.ObjectId.isValid(category) ? category : null;
    }
    
    // Add neighbourhood filter if provided
    if (neighbourhood && mongoose.Types.ObjectId.isValid(neighbourhood)) {
      const hood = await Neighbourhood.findById(neighbourhood);
      if (hood) {
        query['location.coordinates'] = {
          $geoWithin: {
            $geometry: hood.geometry
          }
        };
      }
    }
    
    // Get counts by status
    const statusStats = await Issue.aggregate([
      { $match: query },
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get counts by category
    const categoryStats = await Issue.aggregate([
      { $match: query },
      { $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Populate category names
    const populatedCategoryStats = await Category.populate(categoryStats, {
      path: '_id',
      select: 'name icon color'
    });
    
    // Get counts by priority
    const priorityStats = await Issue.aggregate([
      { $match: query },
      { $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      { $sort: { 
          _id: 1 // Sort by priority (low, medium, high, urgent)
        } 
      }
    ]);
    
    // Get daily counts for trend
    const trendData = await Issue.aggregate([
      { $match: query },
      { $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } 
          },
          count: { $sum: 1 },
          resolved: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] 
            } 
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get average resolution time
    const resolutionTimeData = await Issue.aggregate([
      { 
        $match: { 
          ...query, 
          status: 'resolved',
          resolvedAt: { $exists: true }
        } 
      },
      { 
        $project: {
          resolutionTimeHours: { 
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              3600000 // Convert ms to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageResolutionTime: { $avg: '$resolutionTimeHours' },
          minResolutionTime: { $min: '$resolutionTimeHours' },
          maxResolutionTime: { $max: '$resolutionTimeHours' }
        }
      }
    ]);
    
    // Return the statistics
    return res.status(200).json({
      success: true,
      data: {
        statusStats: statusStats.map(s => ({
          status: s._id || 'unknown',
          count: s.count
        })),
        categoryStats: populatedCategoryStats.map(c => ({
          category: c._id ? {
            id: c._id._id,
            name: c._id.name,
            icon: c._id.icon,
            color: c._id.color
          } : { name: 'Unknown' },
          count: c.count
        })),
        priorityStats: priorityStats.map(p => ({
          priority: p._id || 'unknown',
          count: p.count
        })),
        trend: trendData.map(d => ({
          date: d._id,
          reported: d.count,
          resolved: d.resolved
        })),
        resolutionTime: resolutionTimeData.length > 0 ? {
          average: Math.round(resolutionTimeData[0].averageResolutionTime * 10) / 10,
          min: Math.round(resolutionTimeData[0].minResolutionTime * 10) / 10,
          max: Math.round(resolutionTimeData[0].maxResolutionTime * 10) / 10
        } : {
          average: 0,
          min: 0,
          max: 0
        },
        totalIssues: await Issue.countDocuments(query),
        openIssues: await Issue.countDocuments({ ...query, status: { $ne: 'resolved' } }),
        resolvedIssues: await Issue.countDocuments({ ...query, status: 'resolved' })
      }
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = exports;