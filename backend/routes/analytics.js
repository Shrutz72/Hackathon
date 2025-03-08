// routes/analytics.js
const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const User = require('../models/User');
const Reward = require('../models/Reward');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Get community impact metrics
router.get('/impact', auth, async (req, res) => {
  try {
    const totalIssuesReported = await Issue.countDocuments();
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
    const resolutionRate = totalIssuesReported > 0 ? (resolvedIssues / totalIssuesReported * 100).toFixed(2) : 0;
    
    const topCategories = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const activeUsers = await User.countDocuments({ 
      reportedIssues: { $exists: true, $not: { $size: 0 } } 
    });
    
    const totalPointsAwarded = await User.aggregate([
      { $group: { _id: null, totalPoints: { $sum: '$points' } } }
    ]);
    
    const avgResolutionTime = await Issue.aggregate([
      { $match: { status: 'resolved' } },
      { $project: {
        resolutionTime: {
          $subtract: [
            { $arrayElemAt: [
              '$statusHistory.timestamp',
              { $indexOfArray: ['$statusHistory.status', 'resolved'] }
            ]},
            '$createdAt'
          ]
        }
      }},
      { $group: {
        _id: null,
        avgTime: { $avg: '$resolutionTime' }
      }}
    ]);
    
    res.json({
      success: true,
      data: {
        totalIssuesReported,
        resolvedIssues,
        resolutionRate: `${resolutionRate}%`,
        activeUsers,
        topCategories,
        totalPointsAwarded: totalPointsAwarded.length > 0 ? totalPointsAwarded[0].totalPoints : 0,
        avgResolutionTime: avgResolutionTime.length > 0 ? Math.floor(avgResolutionTime[0].avgTime / (1000 * 60 * 60 * 24)) : 0 // in days
      }
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user participation stats
router.get('/user-stats', auth, async (req, res) => {
  try {
    const userStats = await User.findById(req.user.id)
      .select('reportedIssues upvotedIssues rewards points')
      .populate('reportedIssues', 'status title createdAt')
      .lean();
    
    // Calculate resolution rate of user's reported issues
    const resolvedIssues = userStats.reportedIssues.filter(issue => issue.status === 'resolved').length;
    const resolutionRate = userStats.reportedIssues.length > 0 ? 
      (resolvedIssues / userStats.reportedIssues.length * 100).toFixed(2) : 0;
    
    // Calculate user rank percentile
    const higherPointUsers = await User.countDocuments({ points: { $gt: userStats.points } });
    const totalUsers = await User.countDocuments();
    const percentile = totalUsers > 0 ? 
      (100 - ((higherPointUsers / totalUsers) * 100)).toFixed(2) : 0;
    
    res.json({
      success: true,
      data: {
        issuesReported: userStats.reportedIssues.length,
        issuesResolved: resolvedIssues,
        resolutionRate: `${resolutionRate}%`,
        upvotes: userStats.upvotedIssues.length,
        rewardsRedeemed: userStats.rewards.length,
        points: userStats.points,
        percentile: `${percentile}%`
      }
    });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;