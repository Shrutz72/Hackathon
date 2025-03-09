// routes/issueRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { check, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const Issue = require('../models/issueModel');
const User = require('../models/userModel');
const { upload } = require('../config/cloudStorage');
const { getFilesByIssueId, deleteFile } = require('../config/cloudStorage');

//route   GET /api/issues
// @desc    Get all issues with pagination, filtering and sorting
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query based on filters
    const queryFilters = {};
    
    // Filter by status
    if (req.query.status) {
      queryFilters.status = req.query.status;
    }
    
    // Filter by category
    if (req.query.category) {
      queryFilters.category = req.query.category;
    }
    
    // Filter by priority
    if (req.query.priority) {
      queryFilters.priority = req.query.priority;
    }
    
    // Filter by location (if latitude and longitude provided)
    if (req.query.lat && req.query.lng && req.query.radius) {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);
      const radius = parseFloat(req.query.radius) / 6371; // Convert radius from KM to radians
      
      queryFilters.location = {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius]
        }
      };
    }
    
    // Search by title or description
    if (req.query.search) {
      queryFilters.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Filter by user
    if (req.query.userId) {
      queryFilters.reportedBy = req.query.userId;
    }
    
    // Sort options
    let sortOptions = {};
    if (req.query.sortBy) {
      if (req.query.sortBy === 'date') {
        sortOptions.createdAt = req.query.sortOrder === 'asc' ? 1 : -1;
      } else if (req.query.sortBy === 'votes') {
        sortOptions.upvotes = req.query.sortOrder === 'asc' ? 1 : -1;
      } else if (req.query.sortBy === 'priority') {
        sortOptions.priority = req.query.sortOrder === 'asc' ? 1 : -1;
      }
    } else {
      // Default sort by date descending
      sortOptions.createdAt = -1;
    }
    
    // Execute query with pagination
    const issues = await Issue.find(queryFilters)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('reportedBy', 'name avatar')
      .populate('assignedTo', 'name avatar');
    
    // Get total count for pagination
    const total = await Issue.countDocuments(queryFilters);
    
    res.json({
      issues,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error in GET /issues:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/issues/:id
// @desc    Get issue by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name avatar')
      .populate('assignedTo', 'name avatar')
      .populate('comments.user', 'name avatar');
    
    if (!issue) {
      return res.status(404).json({ msg: 'Issue not found' });
    }
    
    // Get files associated with this issue
    const files = await getFilesByIssueId(req.params.id);
    
    res.json({ issue, files });
  } catch (err) {
    console.error('Error in GET /issues/:id:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Issue not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/issues
// @desc    Create a new issue
// @access  Private
console.log(upload.array('photos', 5)); // Should log a function
router.post(
  '/',
  authMiddleware,
  upload.array('photos', 5), // Ensure this is a function
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
    check('location', 'Location information is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Parse location data
      let location;
      try {
        location = JSON.parse(req.body.location);
      } catch (err) {
        return res.status(400).json({ msg: 'Invalid location format' });
      }

      // Create new issue
      const newIssue = new Issue({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        priority: req.body.priority || 'medium',
        status: 'new',
        reportedBy: req.user.id,
        location: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
          address: location.address,
        },
      });

      // Save the issue
      const issue = await newIssue.save();

      // If files were uploaded, update their metadata with the issue ID
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await gfs.files.updateOne(
            { filename: file.filename },
            { $set: { 'metadata.issueId': issue._id } }
          );
        }
      }

      // Increment user's reportCount (for gamification)
      await User.findByIdAndUpdate(req.user.id, { $inc: { reportCount: 1 } });

      res.json(issue);
    } catch (err) {
      console.error('Error in POST /issues:', err.message);
      res.status(500).send('Server Error');
    }
  }
);
// @route   PUT /api/issues/:id
// @desc    Update an issue
// @access  Private
router.put(
  '/:id',
  authMiddleware,
  upload.array('photos', 5), // Ensure this is a function
  [
    check('title').optional(),
    check('description').optional(),
    check('category').optional(),
    check('status').optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const issue = await Issue.findById(req.params.id);

      if (!issue) {
        return res.status(404).json({ msg: 'Issue not found' });
      }

      // Check if user is authorized to update this issue
      if (
        issue.reportedBy.toString() !== req.user.id &&
        req.user.role !== 'admin' &&
        req.user.role !== 'moderator'
      ) {
        return res.status(401).json({ msg: 'Not authorized to update this issue' });
      }

      // Build issue update object
      const issueFields = {};
      if (req.body.title) issueFields.title = req.body.title;
      if (req.body.description) issueFields.description = req.body.description;
      if (req.body.category) issueFields.category = req.body.category;
      if (req.body.priority) issueFields.priority = req.body.priority;
      if (req.body.status) {
        issueFields.status = req.body.status;

        // If status changed to 'resolved', set resolvedAt timestamp
        if (req.body.status === 'resolved' && issue.status !== 'resolved') {
          issueFields.resolvedAt = Date.now();
        }

        // If status changed to 'closed', set closedAt timestamp
        if (req.body.status === 'closed' && issue.status !== 'closed') {
          issueFields.closedAt = Date.now();
        }
      }

      if (req.body.assignedTo) issueFields.assignedTo = req.body.assignedTo;

      // Check if location is being updated
      if (req.body.location) {
        try {
          const location = JSON.parse(req.body.location);
          issueFields.location = {
            type: 'Point',
            coordinates: [location.longitude, location.latitude],
            address: location.address,
          };
        } catch (err) {
          return res.status(400).json({ msg: 'Invalid location format' });
        }
      }

      // Update timestamp
      issueFields.updatedAt = Date.now();

      // Track history of updates
      const updateEntry = {
        updatedBy: req.user.id,
        updatedAt: Date.now(),
        changes: {},
      };

      // Record changes for history
      for (const [key, value] of Object.entries(issueFields)) {
        if (key !== 'updatedAt' && issue[key] !== value) {
          updateEntry.changes[key] = {
            from: issue[key],
            to: value,
          };
        }
      }

      // Only add to history if there are actual changes
      if (Object.keys(updateEntry.changes).length > 0) {
        issue.updateHistory.push(updateEntry);
      }

      // Update the issue
      const updatedIssue = await Issue.findByIdAndUpdate(
        req.params.id,
        { $set: issueFields, updateHistory: issue.updateHistory },
        { new: true }
      )
        .populate('reportedBy', 'name avatar')
        .populate('assignedTo', 'name avatar');

      // If files were uploaded, they're already handled by multer middleware

      res.json(updatedIssue);
    } catch (err) {
      console.error('Error in PUT /issues/:id:', err.message);

      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Issue not found' });
      }

      res.status(500).send('Server Error');
    }
  }
);
// @route   DELETE /api/issues/:id
// @desc    Delete an issue
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ msg: 'Issue not found' });
    }
    
    // Check if user is authorized to delete this issue
    // Allow if user is the reporter or an admin
    if (
      issue.reportedBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ msg: 'Not authorized to delete this issue' });
    }
    
    // Delete associated files
    const files = await getFilesByIssueId(req.params.id);
    for (const file of files) {
      await deleteFile(file.filename);
    }
    
    // Delete the issue
    await Issue.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Issue removed' });
  } catch (err) {
    console.error('Error in DELETE /issues/:id:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Issue not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/issues/:id/upvote
// @desc    Upvote an issue
// @access  Private
router.post('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ msg: 'Issue not found' });
    }
    
    // Check if user has already upvoted this issue
    if (issue.upvotes.some(upvote => upvote.user.toString() === req.user.id)) {
      // Remove upvote if already upvoted
      issue.upvotes = issue.upvotes.filter(
        upvote => upvote.user.toString() !== req.user.id
      );
    } else {
      // Add upvote
      issue.upvotes.push({ user: req.user.id });
    }
    
    await issue.save();
    
    res.json(issue.upvotes);
  } catch (err) {
    console.error('Error in POST /issues/:id/upvote:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Issue not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/issues/:id/comments
// @desc    Add a comment to an issue
// @access  Private
router.post(
  '/:id/comments',
  authMiddleware,
  check('text', 'Comment text is required').not().isEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const issue = await Issue.findById(req.params.id);
      
      if (!issue) {
        return res.status(404).json({ msg: 'Issue not found' });
      }
      
      // Add new comment
      const newComment = {
        user: req.user.id,
        text: req.body.text,
        date: Date.now()
      };
      
      issue.comments.unshift(newComment);
      
      await issue.save();
      
      // Populate user info for the new comment
      await issue.populate('comments.user', 'name avatar');
      
      res.json(issue.comments);
    } catch (err) {
      console.error('Error in POST /issues/:id/comments:', err.message);
      
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Issue not found' });
      }
      
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE /api/issues/:id/comments/:comment_id
// @desc    Delete a comment
// @access  Private
router.delete('/:id/comments/:comment_id', authMiddleware, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ msg: 'Issue not found' });
    }
    
    // Find the comment
    const comment = issue.comments.find(
      comment => comment.id === req.params.comment_id
    );
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Check if user is authorized to delete the comment
    if (
      comment.user.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'moderator'
    ) {
      return res.status(401).json({ msg: 'Not authorized to delete this comment' });
    }
    
    // Remove comment
    issue.comments = issue.comments.filter(
      comment => comment.id !== req.params.comment_id
    );
    
    await issue.save();
    
    res.json(issue.comments);
  } catch (err) {
    console.error('Error in DELETE /issues/:id/comments/:comment_id:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Issue or comment not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/issues/stats/categories
// @desc    Get issue statistics by category
// @access  Public
router.get('/stats/categories', async (req, res) => {
  try {
    const stats = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
            }
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ['$status', 'inProgress'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          resolved: 1,
          inProgress: 1,
          resolutionRate: {
            $multiply: [
              { $divide: ['$resolved', '$count'] },
              100
            ]
          },
          _id: 0
        }
      }
    ]);
    
    res.json(stats);
  } catch (err) {
    console.error('Error in GET /issues/stats/categories:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/issues/stats/resolution-time
// @desc    Get average resolution time statistics
// @access  Public
router.get('/stats/resolution-time', async (req, res) => {
  try {
    const stats = await Issue.aggregate([
      {
        $match: {
          status: 'resolved',
          resolvedAt: { $exists: true }
        }
      },
      {
        $project: {
          category: 1,
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert ms to days
            ]
          }
        }
      },
      {
        $group: {
          _id: '$category',
          averageResolutionDays: { $avg: '$resolutionTime' },
          minResolutionDays: { $min: '$resolutionTime' },
          maxResolutionDays: { $max: '$resolutionTime' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          averageResolutionDays: { $round: ['$averageResolutionDays', 1] },
          minResolutionDays: { $round: ['$minResolutionDays', 1] },
          maxResolutionDays: { $round: ['$maxResolutionDays', 1] },
          count: 1,
          _id: 0
        }
      }
    ]);
    
    res.json(stats);
  } catch (err) {
    console.error('Error in GET /issues/stats/resolution-time:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;