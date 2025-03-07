const User = require('../models/User');
const Report = require('../models/Report');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phoneNumber, address, role } = req.body;

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
      phoneNumber,
      address,
      role: role || 'citizen', // Default role is citizen
      points: 0,
      badges: [],
      joinedDate: Date.now()
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Error in registerUser:', err.message);
    res.status(500).send('Server error');
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Error in loginUser:', err.message);
    res.status(500).send('Server error');
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error in getCurrentUser:', err.message);
    res.status(500).send('Server error');
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, address, profilePicture } = req.body;
    
    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (phoneNumber) profileFields.phoneNumber = phoneNumber;
    if (address) profileFields.address = address;
    if (profilePicture) profileFields.profilePicture = profilePicture;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error('Error in updateProfile:', err.message);
    res.status(500).send('Server error');
  }
};

// Get user activity (reports submitted, upvoted, etc.)
exports.getUserActivity = async (req, res) => {
  try {
    // Get user's reports
    const reports = await Report.find({ reporter: req.user.id })
      .sort({ dateReported: -1 })
      .populate('category', 'name icon');

    // Get user's upvoted reports
    const upvotedReports = await Report.find({ 
      upvotes: { $elemMatch: { user: req.user.id } } 
    })
      .sort({ dateReported: -1 })
      .populate('category', 'name icon');

    // Get user badges and points
    const user = await User.findById(req.user.id)
      .select('points badges');

    res.json({
      reports,
      upvotedReports,
      points: user.points,
      badges: user.badges
    });
  } catch (err) {
    console.error('Error in getUserActivity:', err.message);
    res.status(500).send('Server error');
  }
};

// Award points to user
exports.awardPoints = async (req, res) => {
  try {
    const { userId, points, reason } = req.body;

    // Check if request is from admin or authorized role
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ msg: 'Not authorized to award points' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Add points
    user.points += points;
    
    // Add to points history
    user.pointsHistory.push({
      points,
      reason,
      awardedBy: req.user.id,
      date: Date.now()
    });

    // Check if user qualifies for new badges
    await checkAndAssignBadges(user);

    await user.save();
    
    res.json({ 
      msg: 'Points awarded successfully', 
      currentPoints: user.points 
    });
  } catch (err) {
    console.error('Error in awardPoints:', err.message);
    res.status(500).send('Server error');
  }
};

// Helper function to check and assign badges
async function checkAndAssignBadges(user) {
  // Example badge rules - customize based on your gamification system
  const badgeRules = [
    { name: 'Newcomer', criteria: user => true, icon: '🌱' },
    { name: 'Reporter', criteria: user => user.points >= 50, icon: '📝' },
    { name: 'Problem Solver', criteria: user => user.points >= 200, icon: '🔧' },
    { name: 'Community Champion', criteria: user => user.points >= 500, icon: '🏆' },
    { name: 'Sustainability Advocate', criteria: user => user.points >= 1000, icon: '🌳' }
  ];

  // Check each badge rule
  for (const badge of badgeRules) {
    // Skip if user already has this badge
    if (user.badges.some(b => b.name === badge.name)) continue;
    
    // Check if user qualifies for this badge
    if (badge.criteria(user)) {
      user.badges.push({
        name: badge.name,
        icon: badge.icon,
        dateAwarded: Date.now()
      });
    }
  }
}

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find()
      .sort({ points: -1 })
      .limit(20)
      .select('name points badges profilePicture');
    
    res.json(leaderboard);
  } catch (err) {
    console.error('Error in getLeaderboard:', err.message);
    res.status(500).send('Server error');
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    // Check password for security
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Password is incorrect' });
    }

    // Get all user reports
    const reports = await Report.find({ reporter: req.user.id });

    // Delete user's reports or transfer them to anonymous
    for (const report of reports) {
      // If report has activity from others, anonymize it instead of deleting
      if (report.upvotes.length > 0 || report.comments.length > 0) {
        report.reporter = null; // Set to null or an anonymous user ID
        report.reporterName = 'Anonymous';
        await report.save();
      } else {
        // Delete reports with no community engagement
        await Report.findByIdAndDelete(report._id);
      }
    }

    // Remove user's upvotes from other reports
    await Report.updateMany(
      { 'upvotes.user': req.user.id },
      { $pull: { upvotes: { user: req.user.id } } }
    );

    // Delete user account
    await User.findByIdAndDelete(req.user.id);

    res.json({ msg: 'User account deleted successfully' });
  } catch (err) {
    console.error('Error in deleteAccount:', err.message);
    res.status(500).send('Server error');
  }
};