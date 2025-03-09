const Comment = require('../models/commentModel');
const Report = require('../models/reportModel');
const User = require('../models/userModel');
const { validationResult } = require('express-validator');

// Add a comment to a report
exports.addComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reportId, text, type } = req.body;

    // Verify that report exists
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    // Get user info
    const user = await User.findById(req.user.id).select('name profilePicture role');

    // Create new comment
    const newComment = new Comment({
      report: reportId,
      user: req.user.id,
      userName: user.name,
      userProfilePicture: user.profilePicture,
      userRole: user.role,
      text,
      type: type || 'general', // Types could be: general, solution, update, etc.
      date: Date.now()
    });

    // Save comment
    const comment = await newComment.save();

    // Add comment to report's comment list
    report.comments.push(comment._id);
    
    // If this is an official update, mark as updated
    if (type === 'official-update' && (user.role === 'admin' || user.role === 'government')) {
      report.lastUpdated = Date.now();
      report.status = req.body.newStatus || report.status;
    }
    
    await report.save();

    // Award points for commenting (if not already commented on this report)
    const existingComments = await Comment.find({ 
      report: reportId, 
      user: req.user.id,
      _id: { $ne: comment._id } // Exclude current comment
    });
    
    if (existingComments.length === 0) {
      // First comment by this user on this report
      await User.findByIdAndUpdate(req.user.id, { 
        $inc: { points: 2 },
        $push: { 
          pointsHistory: {
            points: 2,
            reason: 'Commented on a report',
            date: Date.now()
          }
        }
      });
    }

    // Populate user data for response
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name profilePicture role');

    res.json(populatedComment);
  } catch (err) {
    console.error('Error in addComment:', err.message);
    res.status(500).send('Server error');
  }
};

// Get all comments for a report
exports.getReportComments = async (req, res) => {
  try {
    const reportId = req.params.reportId;
    
    // Verify that report exists
    const reportExists = await Report.exists({ _id: reportId });
    if (!reportExists) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    // Get comments sorted by date
    const comments = await Comment.find({ report: reportId })
      .sort({ date: -1 })
      .populate('user', 'name profilePicture role');

    res.json(comments);
  } catch (err) {
    console.error('Error in getReportComments:', err.message);
    res.status(500).send('Server error');
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text } = req.body;
    const commentId = req.params.commentId;

    // Find comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if user is authorized to update this comment
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ msg: 'Not authorized to update this comment' });
    }

    // Update comment
    comment.text = text;
    comment.edited = true;
    comment.editDate = Date.now();

    await comment.save();

    // Populate user data for response
    const updatedComment = await Comment.findById(commentId)
      .populate('user', 'name profilePicture role');

    res.json(updatedComment);
  } catch (err) {
    console.error('Error in updateComment:', err.message);
    res.status(500).send('Server error');
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    // Find comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if user is authorized to delete this comment
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ msg: 'Not authorized to delete this comment' });
    }

    // Remove comment from report's comments array
    await Report.findByIdAndUpdate(comment.report, {
      $pull: { comments: commentId }
    });

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    res.json({ msg: 'Comment removed' });
  } catch (err) {
    console.error('Error in deleteComment:', err.message);
    res.status(500).send('Server error');
  }
};

// Like/upvote a comment
exports.likeComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    // Find comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if comment has already been liked by this user
    if (comment.likes.some(like => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Comment already liked' });
    }

    // Add like
    comment.likes.unshift({ user: req.user.id });
    await comment.save();

    // If this is a solution type comment, award extra points to comment author
    if (comment.type === 'solution' && comment.likes.length >= 5) {
      // Award points to the comment author for suggesting a helpful solution
      await User.findByIdAndUpdate(comment.user, { 
        $inc: { points: 5 },
        $push: { 
          pointsHistory: {
            points: 5,
            reason: 'Solution comment received 5+ likes',
            date: Date.now()
          }
        }
      });
    }

    res.json(comment.likes);
  } catch (err) {
    console.error('Error in likeComment:', err.message);
    res.status(500).send('Server error');
  }
};

// Unlike/remove upvote from a comment
exports.unlikeComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    // Find comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if comment has not been liked by this user
    if (!comment.likes.some(like => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Comment has not yet been liked' });
    }

    // Remove like
    comment.likes = comment.likes.filter(
      like => like.user.toString() !== req.user.id
    );

    await comment.save();

    res.json(comment.likes);
  } catch (err) {
    console.error('Error in unlikeComment:', err.message);
    res.status(500).send('Server error');
  }
};

// Mark a comment as a solution
exports.markAsSolution = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    // Find comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Get the report
    const report = await Report.findById(comment.report);
    
    if (!report) {
      return res.status(404).json({ msg: 'Associated report not found' });
    }

    // Check if user is authorized (report creator, admin, or moderator)
    if (report.reporter.toString() !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'moderator') {
      return res.status(403).json({ msg: 'Not authorized to mark solution' });
    }

    // Update comment type to solution
    comment.type = 'solution';
    await comment.save();

    // Update report to reference this solution
    report.solutions.push(commentId);
    
    // If this is the first solution, update report status
    if (report.solutions.length === 1 && report.status === 'open') {
      report.status = 'in-progress';
    }
    
    await report.save();

    // Award points to solution provider
    await User.findByIdAndUpdate(comment.user, { 
      $inc: { points: 10 },
      $push: { 
        pointsHistory: {
          points: 10,
          reason: 'Comment marked as solution',
          date: Date.now()
        }
      }
    });

    res.json({ 
      msg: 'Comment marked as solution',
      comment
    });
  } catch (err) {
    console.error('Error in markAsSolution:', err.message);
    res.status(500).send('Server error');
  }
};

// Flag a comment as inappropriate
exports.flagComment = async (req, res) => {
  try {
    const { reason } = req.body;
    const commentId = req.params.commentId;

    // Find comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if already flagged by this user
    if (comment.flags.some(flag => flag.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Already flagged by this user' });
    }

    // Add flag
    comment.flags.push({
      user: req.user.id,
      reason,
      date: Date.now()
    });

    // If multiple flags, mark for review
    if (comment.flags.length >= 3) {
      comment.flaggedForReview = true;
    }

    await comment.save();

    res.json({ msg: 'Comment flagged for review' });
  } catch (err) {
    console.error('Error in flagComment:', err.message);
    res.status(500).send('Server error');
  }
};

// Get comments for moderation (admin/moderator only)
exports.getFlaggedComments = async (req, res) => {
  try {
    // Check if user is authorized
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ msg: 'Not authorized to access moderation queue' });
    }

    // Get all flagged comments
    const flaggedComments = await Comment.find({ flaggedForReview: true })
      .sort({ date: -1 })
      .populate('user', 'name email role')
      .populate('report', 'title category location');

    res.json(flaggedComments);
  } catch (err) {
    console.error('Error in getFlaggedComments:', err.message);
    res.status(500).send('Server error');
  }
};

// Moderator action on flagged comment
exports.moderateComment = async (req, res) => {
  try {
    const { action, reason } = req.body;
    const commentId = req.params.commentId;

    // Check if user is authorized
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ msg: 'Not authorized to moderate comments' });
    }

    // Find comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    switch (action) {
      case 'approve':
        // Clear flags and mark as reviewed
        comment.flags = [];
        comment.flaggedForReview = false;
        comment.moderationHistory.push({
          moderator: req.user.id,
          action: 'approved',
          reason,
          date: Date.now()
        });
        break;
        
      case 'edit':
        // Edit content and mark as moderated
        comment.text = req.body.newText || comment.text;
        comment.flags = [];
        comment.flaggedForReview = false;
        comment.edited = true;
        comment.editDate = Date.now();
        comment.moderationHistory.push({
          moderator: req.user.id,
          action: 'edited',
          reason,
          date: Date.now()
        });
        break;
        
      case 'delete':
        // Remove comment from report
        await Report.findByIdAndUpdate(comment.report, {
          $pull: { comments: commentId }
        });
        
        // Add to moderation log
        await Comment.findByIdAndUpdate(commentId, {
          $push: {
            moderationHistory: {
              moderator: req.user.id,
              action: 'deleted',
              reason,
              date: Date.now()
            }
          }
        });
        
        // Delete the comment
        await Comment.findByIdAndDelete(commentId);
        
        return res.json({ msg: 'Comment deleted' });
        
      default:
        return res.status(400).json({ msg: 'Invalid moderation action' });
    }

    await comment.save();
    res.json({ msg: `Comment ${action}ed`, comment });
  } catch (err) {
    console.error('Error in moderateComment:', err.message);
    res.status(500).send('Server error');
  }
};

// Get statistics about comments (admin only)
exports.getCommentStats = async (req, res) => {
  try {
    // Check if user is authorized
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to access statistics' });
    }

    // Get total comment count
    const totalComments = await Comment.countDocuments();
    
    // Get comment count by type
    const commentsByType = await Comment.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get most active users (by comment count)
    const mostActiveUsers = await Comment.aggregate([
      {
        $group: {
          _id: '$user',
          commentCount: { $sum: 1 }
        }
      },
      { $sort: { commentCount: -1 } },
      { $limit: 10 }
    ]);
    
    // Populate user details
    const userIds = mostActiveUsers.map(item => item._id);
    const userDetails = await User.find(
      { _id: { $in: userIds } },
      'name email role'
    );
    
    // Match user details with counts
    const activeUsersWithDetails = mostActiveUsers.map(item => {
      const user = userDetails.find(u => u._id.toString() === item._id.toString());
      return {
        user,
        commentCount: item.commentCount
      };
    });

    // Get comment count per day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const commentsByDay = await Comment.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalComments,
      commentsByType,
      mostActiveUsers: activeUsersWithDetails,
      commentsByDay
    });
  } catch (err) {
    console.error('Error in getCommentStats:', err.message);
    res.status(500).send('Server error');
  }
};