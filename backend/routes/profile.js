// routes/profile.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { validateProfileUpdate } = require('../middleware/validators');

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -__v')
      .populate('reportedIssues', 'title status createdAt')
      .populate('upvotedIssues', 'title status');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
router.put('/', [auth, validateProfileUpdate], async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    // Update profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true }
    ).select('-password -__v');
    
    res.json({ success: true, data: updatedUser });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }
    
    // Get user
    const user = await User.findById(req.user.id);
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update notification settings
router.put('/notification-settings', auth, async (req, res) => {
  try {
    const { 
      emailNotifications, 
      pushNotifications, 
      notifyOnComments,
      notifyOnStatusChange,
      notifyOnNearbyIssues
    } = req.body;
    
    const settings = {};
    
    if (emailNotifications !== undefined) settings.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) settings.pushNotifications = pushNotifications;
    if (notifyOnComments !== undefined) settings.notifyOnComments = notifyOnComments;
    if (notifyOnStatusChange !== undefined) settings.notifyOnStatusChange = notifyOnStatusChange;
    if (notifyOnNearbyIssues !== undefined) settings.notifyOnNearbyIssues = notifyOnNearbyIssues;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notificationSettings: settings },
      { new: true }
    ).select('notificationSettings');
    
    res.json({ success: true, data: user.notificationSettings });
  } catch (err) {
    console.error('Error updating notification settings:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update FCM token for push notifications
router.put('/fcm-token', auth, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({ success: false, message: 'FCM token is required' });
    }
    
    await User.findByIdAndUpdate(req.user.id, { fcmToken });
    
    res.json({ success: true, message: 'FCM token updated successfully' });
  } catch (err) {
    console.error('Error updating FCM token:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;