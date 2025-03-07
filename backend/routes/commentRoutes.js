const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Report = require('../models/Report');
const User = require('../models/User');

// @route   POST api/comments/:reportId
// @desc    Add a comment to a report
// @access  Private
router.post('/:reportId', auth, async (req, res) => {
  try {
    const { text, attachmentUrl } = req.body;
    const reportId = req.params.reportId;

    // Find the report
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    // Create new comment object
    const newComment = {
      user: req.user.id,
      text,
      datePosted: Date.now(),
      votes: {
        upvotes: [],
        downvotes: []
      }
    };

    // Add attachment URL if provided
    if (attachmentUrl) {
      newComment.attachmentUrl = attachmentUrl;
    }

    // Add comment to report
    report.comments.unshift(newComment);
    await report.save();

    // Get user info for the comment
    const user = await User.findById(req.user.id).select('name profilePicture');

    // Return the newly added comment with user info
    const commentWithUser = {
      ...report.comments[0].toObject(),
      user: {
        _id: user._id,
        name: user.name,
        profilePicture: user.profilePicture
      }
    };

    // Award points for commenting
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { points: 2 } } // Award 2 points for adding a comment
    );

    res.json(commentWithUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/comments/:reportId
// @desc    Get all comments for a report
// @access  Public
router.get('/:reportId', async (req, res) => {
  try {
    const reportId = req.params.reportId;

    // Find the report
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    // Get user info for each comment
    const commentsWithUserInfo = await Promise.all(
      report.comments.map(async (comment) => {
        const user = await User.findById(comment.user).select('name profilePicture');
        return {
          ...comment.toObject(),
          user: {
            _id: user._id,
            name: user.name,
            profilePicture: user.profilePicture
          }
        };
      })
    );

    res.json(commentsWithUserInfo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/comments/:reportId/:commentId
// @desc    Update a comment
// @access  Private
router.put('/:reportId/:commentId', auth, async (req, res) => {
  try {
    const { reportId, commentId } = req.params;
    const { text, attachmentUrl } = req.body;

    // Find the report
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    // Find the comment
    const comment = report.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if user is the owner of the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update comment
    comment.text = text;
    comment.dateEdited = Date.now();
    if (attachmentUrl) {
      comment.attachmentUrl = attachmentUrl;
    }

    await report.save();

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/comments/:reportId/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:reportId/:commentId', auth, async (req, res) => {
  try {
    const { reportId, commentId } = req.params;

    // Find the report
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    // Find the comment
    const comment = report.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if user is the owner of the comment or an admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Remove the comment
    comment.remove();
    await report.save();

    res.json({ msg: 'Comment deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/comments/:reportId/:commentId/upvote
// @desc    Upvote a comment
// @access  Private
router.put('/:reportId/:commentId/upvote', auth, async (req, res) => {
  try {
    const { reportId, commentId } = req.params;

    // Find the report
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    // Find the comment
    const comment = report.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if the user has already upvoted this comment
    if (comment.votes.upvotes.includes(req.user.id)) {
      // Remove upvote (toggle)
      comment.votes.upvotes = comment.votes.upvotes.filter(
        userId => userId.toString() !== req.user.id
      );
    } else {
      // Add upvote and remove from downvotes if present
      comment.votes.upvotes.push(req.user.id);
      comment.votes.downvotes = comment.votes.downvotes.filter(
        userId => userId.toString() !== req.user.id
      );

      // Award points to comment owner (only if this is a new upvote)
      if (comment.user.toString() !== req.user.id) {
        await User.findByIdAndUpdate(
          comment.user,
          { $inc: { points: 1 } } // Award 1 point for receiving an upvote
        );
      }
    }

    await report.save();

    res.json({
      upvotes: comment.votes.upvotes,
      downvotes: comment.votes.downvotes
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/comments/:reportId/:commentId/downvote
// @desc    Downvote a comment
// @access  Private
router.put('/:reportId/:commentId/downvote', auth, async (req, res) => {
  try {
    const { reportId, commentId } = req.params;

    // Find the report
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    // Find the comment
    const comment = report.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if the user has already downvoted this comment
    if (comment.votes.downvotes.includes(req.user.id)) {
      // Remove downvote (toggle)
      comment.votes.downvotes = comment.votes.downvotes.filter(
        userId => userId.toString() !== req.user.id
      );
    } else {
      // Add downvote and remove from upvotes if present
      comment.votes.downvotes.push(req.user.id);
      comment.votes.upvotes = comment.votes.upvotes.filter(
        userId => userId.toString() !== req.user.id
      );
    }

    await report.save();

    res.json({
      upvotes: comment.votes.upvotes,
      downvotes: comment.votes.downvotes
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/comments/user/:userId
// @desc    Get all comments by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find reports that contain comments from this user
    const reports = await Report.find({ 'comments.user': userId });

    // Extract comments made by the user
    const userComments = [];
    reports.forEach(report => {
      const filteredComments = report.comments.filter(
        comment => comment.user.toString() === userId
      );

      filteredComments.forEach(comment => {
        userComments.push({
          reportId: report._id,
          reportTitle: report.title,
          reportCategory: report.category,
          comment: comment
        });
      });
    });

    res.json(userComments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/comments/feed
// @desc    Get recent comments across all reports
// @access  Public
router.get('/feed', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Find reports with comments
    const reports = await Report.find(
      { 'comments.0': { $exists: true } },
      { title: 1, category: 1, location: 1, comments: { $slice: 3 } }
    ).sort({ 'comments.datePosted': -1 }).limit(20);
    
    // Extract and flatten comments from all reports
    let allComments = [];
    reports.forEach(report => {
      report.comments.forEach(comment => {
        allComments.push({
          reportId: report._id,
          reportTitle: report.title,
          reportCategory: report.category,
          reportLocation: report.location,
          comment
        });
      });
    });
    
    // Sort by date and limit
    allComments.sort((a, b) => 
      new Date(b.comment.datePosted) - new Date(a.comment.datePosted)
    );
    allComments = allComments.slice(0, limit);
    
    // Get user info for each comment
    const commentsWithUserInfo = await Promise.all(
      allComments.map(async (item) => {
        const user = await User.findById(item.comment.user).select('name profilePicture');
        return {
          ...item,
          comment: {
            ...item.comment.toObject(),
            user: {
              _id: user._id,
              name: user.name,
              profilePicture: user.profilePicture
            }
          }
        };
      })
    );
    
    res.json(commentsWithUserInfo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/comments/:reportId/:commentId/flag
// @desc    Flag a comment as inappropriate
// @access  Private
router.post('/:reportId/:commentId/flag', auth, async (req, res) => {
  try {
    const { reportId, commentId } = req.params;
    const { reason } = req.body;

    // Find the report
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    // Find the comment
    const comment = report.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Initialize flags array if it doesn't exist
    if (!comment.flags) {
      comment.flags = [];
    }

    // Check if user has already flagged this comment
    const existingFlag = comment.flags.find(
      flag => flag.user.toString() === req.user.id
    );

    if (existingFlag) {
      return res.status(400).json({ msg: 'Comment already flagged by this user' });
    }

    // Add flag
    comment.flags.push({
      user: req.user.id,
      reason,
      dateReported: Date.now()
    });

    await report.save();

    res.json({ msg: 'Comment flagged successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/comments/flagged
// @desc    Get all flagged comments (admin only)
// @access  Private/Admin
router.get('/flagged', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized: Admin access required' });
    }

    // Find reports with flagged comments
    const reports = await Report.find({ 'comments.flags.0': { $exists: true } });

    // Extract flagged comments
    const flaggedComments = [];
    reports.forEach(report => {
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

    // Get user info for each comment
    const commentsWithUserInfo = await Promise.all(
      flaggedComments.map(async (item) => {
        const user = await User.findById(item.comment.user).select('name profilePicture email');
        return {
          ...item,
          comment: {
            ...item.comment.toObject(),
            user: {
              _id: user._id,
              name: user.name,
              profilePicture: user.profilePicture,
              email: user.email
            }
          }
        };
      })
    );

    res.json(commentsWithUserInfo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;