const Issue = require('../models/issueModel');
const User = require('../models/userModel');
const Community = require('../models/communityModel');
const Project = require('../models/projectModel');
const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');

/**
 * Dashboard Controller
 * Handles data aggregation and statistics for the community engagement platform
 */

// Get user dashboard data
exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's reported issues
    const reportedIssues = await Issue.find({ reportedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get user's statistics
    const issueStats = await Issue.aggregate([
      { $match: { reportedBy: mongoose.Types.ObjectId(userId) } },
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user's badges and points
    const user = await User.findById(userId).select('points badges contributionStats');

    // Get nearby active projects
    const nearbyProjects = await Project.find({ 
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: user.location.coordinates
          },
          $maxDistance: 10000 // 10km radius
        }
      },
      status: 'active'
    }).limit(3);

    // Format status counts for frontend
    const statusCounts = {
      pending: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0
    };

    issueStats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        reportedIssues,
        statusCounts,
        userStats: {
          points: user.points,
          badges: user.badges,
          contributionStats: user.contributionStats
        },
        nearbyProjects
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

// Get community dashboard data
exports.getCommunityDashboard = async (req, res) => {
  try {
    const { communityId } = req.params;
    
    // Verify community exists and user has access
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Get recent issues in this community
    const recentIssues = await Issue.find({ 
      'location.community': communityId 
    })
    .sort({ upvotes: -1, createdAt: -1 })
    .limit(10)
    .populate('reportedBy', 'name avatar');

    // Get issue statistics by category
    const categoryStats = await Issue.aggregate([
      { $match: { 'location.community': mongoose.Types.ObjectId(communityId) } },
      { $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] 
            } 
          },
          pending: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] 
            } 
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get top contributors
    const topContributors = await User.find({
      communities: communityId
    })
    .sort({ points: -1 })
    .limit(5)
    .select('name avatar points badges');

    // Get active projects
    const activeProjects = await Project.find({
      community: communityId,
      status: 'active'
    })
    .sort({ participantCount: -1 })
    .limit(3);

    // Get monthly issue trends
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrends = await Issue.aggregate([
      { 
        $match: { 
          'location.community': mongoose.Types.ObjectId(communityId),
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' }, 
            year: { $year: '$createdAt' } 
          },
          reported: { $sum: 1 },
          resolved: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] 
            } 
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        communityInfo: {
          name: community.name,
          description: community.description,
          memberCount: community.memberCount,
          location: community.location
        },
        recentIssues,
        categoryStats,
        topContributors,
        activeProjects,
        monthlyTrends
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch community dashboard data',
      error: error.message
    });
  }
};

// Get admin dashboard data
exports.getAdminDashboard = async (req, res) => {
  try {
    // Check if user has admin privileges
    if (!req.user.isAdmin) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Unauthorized access to admin dashboard'
      });
    }

    // Get overall platform statistics
    const totalIssues = await Issue.countDocuments();
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
    const pendingIssues = await Issue.countDocuments({ status: 'pending' });
    const inProgressIssues = await Issue.countDocuments({ status: 'inProgress' });
    
    const totalUsers = await User.countDocuments();
    const totalCommunities = await Community.countDocuments();
    const totalProjects = await Project.countDocuments();

    // Get most active communities
    const activeCommunities = await Community.find()
      .sort({ issueCount: -1, memberCount: -1 })
      .limit(5)
      .select('name location issueCount memberCount resolvedIssueCount');

    // Get issues by category
    const issuesByCategory = await Issue.aggregate([
      { $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get monthly growth statistics
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const monthlyGrowth = await User.aggregate([
      { 
        $match: { 
          createdAt: { $gte: oneYearAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' }, 
            year: { $year: '$createdAt' } 
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get urgent issues requiring attention
    const urgentIssues = await Issue.find({
      status: 'pending',
      upvotes: { $gte: 10 }
    })
    .sort({ upvotes: -1, createdAt: 1 })
    .limit(10)
    .populate('location.community', 'name');

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        platformStats: {
          totalIssues,
          resolvedIssues,
          pendingIssues,
          inProgressIssues,
          resolutionRate: (resolvedIssues / totalIssues * 100).toFixed(2),
          totalUsers,
          totalCommunities,
          totalProjects
        },
        activeCommunities,
        issuesByCategory,
        monthlyGrowth,
        urgentIssues
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch admin dashboard data',
      error: error.message
    });
  }
};

// Get issue heatmap data
exports.getIssueHeatmap = async (req, res) => {
  try {
    const { category, timeframe } = req.query;
    
    // Set timeframe filter
    let dateFilter = {};
    if (timeframe === 'week') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      dateFilter = { createdAt: { $gte: lastWeek } };
    } else if (timeframe === 'month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      dateFilter = { createdAt: { $gte: lastMonth } };
    } else if (timeframe === 'year') {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      dateFilter = { createdAt: { $gte: lastYear } };
    }
    
    // Build query based on filters
    const query = { ...dateFilter };
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Get geolocated issues for heatmap
    const heatmapData = await Issue.find(query)
      .select('location.coordinates title category status upvotes')
      .sort({ createdAt: -1 })
      .limit(1000); // Limit to prevent overwhelming the client
    
    // Format data for frontend heatmap
    const formattedData = heatmapData.map(issue => ({
      id: issue._id,
      lat: issue.location.coordinates[1],
      lng: issue.location.coordinates[0],
      title: issue.title,
      category: issue.category,
      status: issue.status,
      intensity: issue.upvotes + 1 // Add 1 to ensure even 0 upvoted issues show on map
    }));
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch heatmap data',
      error: error.message
    });
  }
};

// Get project metrics
exports.getProjectMetrics = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Get project participation metrics
    const participationMetrics = await User.aggregate([
      { $match: { participatedProjects: mongoose.Types.ObjectId(projectId) } },
      { $group: {
          _id: null,
          totalParticipants: { $sum: 1 },
          averageContribution: { $avg: '$contributionStats.hoursContributed' },
          topContributors: { $push: { 
            userId: '$_id', 
            name: '$name', 
            contribution: '$contributionStats.hoursContributed' 
          }}
        }
      },
      { $unwind: '$topContributors' },
      { $sort: { 'topContributors.contribution': -1 } },
      { $limit: 5 },
      { $group: {
          _id: null,
          totalParticipants: { $first: '$totalParticipants' },
          averageContribution: { $first: '$averageContribution' },
          topContributors: { $push: '$topContributors' }
        }
      }
    ]);
    
    // Get project milestone completion status
    const milestones = project.milestones.map(milestone => ({
      title: milestone.title,
      description: milestone.description,
      dueDate: milestone.dueDate,
      completed: milestone.completed,
      percentage: milestone.percentage
    }));
    
    // Get related issues that have been resolved through this project
    const relatedIssues = await Issue.find({ 
      _id: { $in: project.relatedIssues },
      status: { $in: ['resolved', 'closed'] }
    })
    .select('title category status resolvedAt')
    .limit(10);
    
    // Calculate project impact
    const impact = {
      issuesResolved: relatedIssues.length,
      peopleImpacted: project.peopleImpacted || project.participantCount * 10, // Estimate if not set
      completionPercentage: project.completionPercentage,
      successMetrics: project.successMetrics || {}
    };
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        projectInfo: {
          name: project.name,
          description: project.description,
          startDate: project.startDate,
          endDate: project.endDate,
          status: project.status,
          category: project.category
        },
        participation: participationMetrics[0] || {
          totalParticipants: 0,
          averageContribution: 0,
          topContributors: []
        },
        milestones,
        impact,
        relatedIssues
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch project metrics',
      error: error.message
    });
  }
};

// Get user achievement statistics
exports.getUserAchievements = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    const user = await User.findById(userId)
      .select('name avatar points badges contributionStats achievements communities')
      .populate('communities', 'name');
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user's reported and resolved issues
    const issuesReported = await Issue.countDocuments({ reportedBy: userId });
    const issuesResolved = await Issue.countDocuments({ 
      reportedBy: userId,
      status: { $in: ['resolved', 'closed'] }
    });
    
    // Get projects user participated in
    const projectsParticipated = await Project.find({
      participants: userId
    })
    .select('name status completionPercentage category')
    .limit(5);
    
    // Get user's impact score based on activity
    const impactScore = user.points + 
      (issuesReported * 5) + 
      (issuesResolved * 10) + 
      (user.contributionStats?.hoursContributed || 0) * 20;
    
    // Get the next badge the user can earn
    const nextBadge = {
      name: user.points < 100 ? 'Active Citizen' : 
            user.points < 500 ? 'Community Champion' : 
            user.points < 1000 ? 'Neighborhood Hero' : 'Civic Leader',
      pointsRequired: user.points < 100 ? 100 :
                      user.points < 500 ? 500 :
                      user.points < 1000 ? 1000 : 2000,
      currentPoints: user.points
    };
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        userInfo: {
          name: user.name,
          avatar: user.avatar,
          points: user.points,
          badges: user.badges,
          communities: user.communities
        },
        activityStats: {
          issuesReported,
          issuesResolved,
          projectsParticipated: projectsParticipated.length,
          hoursContributed: user.contributionStats?.hoursContributed || 0,
          commentsPosted: user.contributionStats?.commentsPosted || 0,
          solutionsSuggested: user.contributionStats?.solutionsSuggested || 0
        },
        achievements: user.achievements || [],
        impactScore,
        nextBadge,
        recentProjects: projectsParticipated
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch user achievements',
      error: error.message
    });
  }
};

module.exports = exports;