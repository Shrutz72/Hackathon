const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/userModel');
const Report = require('../models/reportModel');

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, neighborhood, phoneNumber } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      neighborhood,
      phoneNumber,
      dateJoined: Date.now(),
      role: 'citizen', // Default role
      points: 0,
      badges: []
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // Find user by id (exclude password)
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, neighborhood, phoneNumber, bio, profilePicture } = req.body;
    
    // Build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (neighborhood) userFields.neighborhood = neighborhood;
    if (phoneNumber) userFields.phoneNumber = phoneNumber;
    if (bio) userFields.bio = bio;
    if (profilePicture) userFields.profilePicture = profilePicture;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user from database
    const user = await User.findById(req.user.id);
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Save updated user
    await user.save();
    
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/reports
// @desc    Get all reports created by current user
// @access  Private
router.get('/reports', auth, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id })
      .sort({ dateCreated: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/contributions
// @desc    Get user's contribution statistics
// @access  Private
router.get('/contributions', auth, async (req, res) => {
  try {
    // Get user (to access points and badges)
    const user = await User.findById(req.user.id).select('-password');
    
    // Count reports
    const reportCount = await Report.countDocuments({ user: req.user.id });
    
    // Count resolved reports (where status is 'resolved')
    const resolvedReportCount = await Report.countDocuments({ 
      user: req.user.id,
      status: 'resolved'
    });
    
    // Count comments on reports
    const commentCount = await Report.aggregate([
      { $match: { 'comments.user': req.user.id } },
      { $project: { 
          commentCount: {
            $size: {
              $filter: {
                input: '$comments',
                as: 'comment',
                cond: { $eq: ['$$comment.user', req.user.id] }
              }
            }
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$commentCount' } } }
    ]);
    
    // Prepare response
    const contributions = {
      points: user.points,
      badges: user.badges,
      reportCount,
      resolvedReportCount,
      commentCount: commentCount[0]?.total || 0
    };
    
    res.json(contributions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/leaderboard
// @desc    Get community leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    // Get top users by points
    const topUsers = await User.find()
      .sort({ points: -1 })
      .limit(10)
      .select('name neighborhood points badges profilePicture');
    
    res.json(topUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/award-points
// @desc    Award points to a user (admin only)
// @access  Private/Admin
router.post('/award-points', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized: Admin access required' });
    }
    
    const { userId, points, reason } = req.body;
    
    // Award points to user
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { points } },
      { new: true }
    ).select('-password');
    
    // Log point transaction
    // You might want to create a separate model for point transactions
    
    res.json({ msg: `Awarded ${points} points to ${user.name}`, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/award-badge
// @desc    Award badge to a user (admin only)
// @access  Private/Admin
router.post('/award-badge', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized: Admin access required' });
    }
    
    const { userId, badge } = req.body;
    
    // Add badge to user
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { badges: badge } }, // $addToSet ensures no duplicate badges
      { new: true }
    ).select('-password');
    
    res.json({ msg: `Awarded "${badge.name}" badge to ${user.name}`, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/:userId
// @desc    Get public user profile by ID
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name neighborhood dateJoined points badges profilePicture bio');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Get count of user's reports
    const reportCount = await Report.countDocuments({ user: req.params.userId });
    
    // Get user's latest reports
    const latestReports = await Report.find({ user: req.params.userId })
      .sort({ dateCreated: -1 })
      .limit(5);
    
    // Combine user info with activity stats
    const userProfile = {
      ...user.toObject(),
      reportCount,
      latestReports
    };
    
    res.json(userProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;