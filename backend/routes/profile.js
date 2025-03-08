// routes/profile.js
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Error in GET /profile:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/profile
// @desc    Update current user's profile
// @access  Private
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const userFields = {};
    if (name) userFields.name = name;
    if (avatar) userFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error('Error in PUT /profile:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;