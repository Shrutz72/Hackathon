// routes/analytics.js
const express = require('express');
const router = express.Router();
const Issue = require('../models/issueModel');

// @route   GET /api/analytics/categories
// @desc    Get issue statistics by category
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const stats = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0],
            },
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ['$status', 'inProgress'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          resolved: 1,
          inProgress: 1,
          resolutionRate: {
            $multiply: [{ $divide: ['$resolved', '$count'] }, 100],
          },
          _id: 0,
        },
      },
    ]);

    res.json(stats);
  } catch (err) {
    console.error('Error in GET /analytics/categories:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/analytics/resolution-time
// @desc    Get average resolution time statistics
// @access  Public
router.get('/resolution-time', async (req, res) => {
  try {
    const stats = await Issue.aggregate([
      {
        $match: {
          status: 'resolved',
          resolvedAt: { $exists: true },
        },
      },
      {
        $project: {
          category: 1,
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60 * 24, // Convert ms to days
            ],
          },
        },
      },
      {
        $group: {
          _id: '$category',
          averageResolutionDays: { $avg: '$resolutionTime' },
          minResolutionDays: { $min: '$resolutionTime' },
          maxResolutionDays: { $max: '$resolutionTime' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          category: '$_id',
          averageResolutionDays: { $round: ['$averageResolutionDays', 1] },
          minResolutionDays: { $round: ['$minResolutionDays', 1] },
          maxResolutionDays: { $round: ['$maxResolutionDays', 1] },
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.json(stats);
  } catch (err) {
    console.error('Error in GET /analytics/resolution-time:', err.message);
    res.status(500).send('Server Error');

  }
});

module.exports = router;