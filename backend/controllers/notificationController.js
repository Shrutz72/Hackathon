const Notification = require('../models/Notification');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Project = require('../models/Project');
const Community = require('../models/Community');
const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');

/**
 * Notification Controller
 * Handles creating, retrieving, and managing notifications for the community platform
 */

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    // Build query
    const query = { recipient: userId };
    
    // Add filter for unread notifications if requested
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    // Get total count for pagination
    const totalCount = await Notification.countDocuments(query);
    
    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('sender', 'name avatar');
    
    // Get unread count
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId,
      read: false
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        notifications,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalCount / limit)
        },
        unreadCount
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    notification.read = true;
    await notification.save();
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    await notification.remove();
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      issueUpdates,
      communityAnnouncements,
      projectInvitations,
      commentReplies,
      mentions,
      emailNotifications,
      pushNotifications,
      smsNotifications,
      digestFrequency
    } = req.body;
    
    // Find user and update notification preferences
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create notification preferences object if it doesn't exist
    if (!user.notificationPreferences) {
      user.notificationPreferences = {};
    }
    
    // Update notification preferences
    const preferences = user.notificationPreferences;
    
    if (issueUpdates !== undefined) preferences.issueUpdates = issueUpdates;
    if (communityAnnouncements !== undefined) preferences.communityAnnouncements = communityAnnouncements;
    if (projectInvitations !== undefined) preferences.projectInvitations = projectInvitations;
    if (commentReplies !== undefined) preferences.commentReplies = commentReplies;
    if (mentions !== undefined) preferences.mentions = mentions;
    if (emailNotifications !== undefined) preferences.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) preferences.pushNotifications = pushNotifications;
    if (smsNotifications !== undefined) preferences.smsNotifications = smsNotifications;
    if (digestFrequency !== undefined) preferences.digestFrequency = digestFrequency;
    
    await user.save();
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: user.notificationPreferences
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
};

// Create a notification (utility function for internal use)
exports.createNotification = async (options) => {
  try {
    const {
      type,
      title,
      message,
      recipient,
      sender,
      relatedId,
      relatedType,
      actionUrl,
      priority = 'normal'
    } = options;
    
    // Check if recipient has opted out of this notification type
    const recipientUser = await User.findById(recipient);
    
    if (recipientUser && recipientUser.notificationPreferences) {
      const preferences = recipientUser.notificationPreferences;
      
      // Check if user has opted out of this type of notification
      if (
        (type === 'issue_update' && preferences.issueUpdates === false) ||
        (type === 'community_announcement' && preferences.communityAnnouncements === false) ||
        (type === 'project_invitation' && preferences.projectInvitations === false) ||
        (type === 'comment_reply' && preferences.commentReplies === false) ||
        (type === 'mention' && preferences.mentions === false)
      ) {
        // Skip creating notification if user opted out
        return null;
      }
    }
    
    // Create the notification
    const notification = new Notification({
      type,
      title,
      message,
      recipient,
      sender,
      relatedId,
      relatedType,
      actionUrl,
      priority,
      read: false,
      createdAt: new Date()
    });
    
    await notification.save();
    
    // Return the created notification
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};

// Send issue update notifications
exports.sendIssueUpdateNotification = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { updateType, message } = req.body;
    const userId = req.user.id;
    
    // Find the issue
    const issue = await Issue.findById(issueId)
      .populate('reportedBy', 'name')
      .populate('followers');
    
    if (!issue) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Issue not found'
      });
    }
    
    // Determine title based on update type
    let title;
    switch(updateType) {
      case 'status_change':
        title = `Issue status changed to ${issue.status}`;
        break;
      case 'comment':
        title = 'New comment on your reported issue';
        break;
      case 'resolution':
        title = 'Issue has been resolved';
        break;
      case 'assignment':
        title = 'Issue has been assigned';
        break;
      default:
        title = 'Update on your reported issue';
    }
    
    // Create list of recipients (reporter + followers)
    const recipients = [issue.reportedBy._id.toString()];
    
    // Add followers if they exist
    if (issue.followers && issue.followers.length > 0) {
      issue.followers.forEach(follower => {
        if (follower._id.toString() !== issue.reportedBy._id.toString()) {
          recipients.push(follower._id.toString());
        }
      });
    }
    
    // Filter out current user (don't notify self of updates)
    const filteredRecipients = recipients.filter(id => id !== userId);
    
    // Send notifications to all recipients
    const notificationPromises = filteredRecipients.map(recipient => 
      exports.createNotification({
        type: 'issue_update',
        title,
        message: message || `There's an update on issue: ${issue.title}`,
        recipient,
        sender: userId,
        relatedId: issueId,
        relatedType: 'Issue',
        actionUrl: `/issues/${issueId}`,
        priority: updateType === 'resolution' ? 'high' : 'normal'
      })
    );
    
    await Promise.all(notificationPromises);
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Issue update notifications sent successfully',
      data: {
        recipientCount: filteredRecipients.length
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to send issue update notifications',
      error: error.message
    });
  }
};

// Send community announcement
exports.sendCommunityAnnouncement = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { title, message, importance } = req.body;
    const userId = req.user.id;
    
    // Verify community exists
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Community not found'
      });
    }
    
    // Verify user has permission to send announcements
    const isAdmin = await Community.findOne({
      _id: communityId,
      admins: userId
    });
    
    if (!isAdmin && !req.user.isAdmin) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to send announcements to this community'
      });
    }
    
    // Find all members of the community
    const communityMembers = await User.find({
      communities: communityId
    }).select('_id');
    
    // Map to array of IDs
    const memberIds = communityMembers.map(member => member._id.toString());
    
    // Filter out current user
    const filteredRecipients = memberIds.filter(id => id !== userId);
    
    // Determine priority based on importance
    const priority = importance === 'high' ? 'high' : 'normal';
    
    // Send notifications to all members
    const notificationPromises = filteredRecipients.map(recipient => 
      exports.createNotification({
        type: 'community_announcement',
        title: title || `Announcement from ${community.name}`,
        message,
        recipient,
        sender: userId,
        relatedId: communityId,
        relatedType: 'Community',
        actionUrl: `/communities/${communityId}`,
        priority
      })
    );
    
    await Promise.all(notificationPromises);
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Community announcement sent successfully',
      data: {
        recipientCount: filteredRecipients.length
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to send community announcement',
      error: error.message
    });
  }
};

// Send project invitation
exports.sendProjectInvitation = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userIds, message } = req.body;
    const senderId = req.user.id;
    
    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Verify sender is project admin or community admin
    const isProjectAdmin = project.admins.includes(senderId);
    const isCommunityAdmin = await Community.findOne({
      _id: project.community,
      admins: senderId
    });
    
    if (!isProjectAdmin && !isCommunityAdmin && !req.user.isAdmin) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to invite users to this project'
      });
    }
    
    // Verify users exist
    const users = await User.find({
      _id: { $in: userIds }
    }).select('_id');
    
    const validUserIds = users.map(user => user._id.toString());
    
    // Send invitations
    const notificationPromises = validUserIds.map(userId => 
      exports.createNotification({
        type: 'project_invitation',
        title: `Invitation to join ${project.name}`,
        message: message || `You've been invited to participate in the project: ${project.name}`,
        recipient: userId,
        sender: senderId,
        relatedId: projectId,
        relatedType: 'Project',
        actionUrl: `/projects/${projectId}/join`,
        priority: 'high'
      })
    );
    
    await Promise.all(notificationPromises);
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Project invitations sent successfully',
      data: {
        invitedCount: validUserIds.length
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to send project invitations',
      error: error.message
    });
  }
};

// Send achievement notification
exports.sendAchievementNotification = async (userId, achievementType, achievementDetails) => {
  try {
    let title, message;
    
    // Determine notification content based on achievement type
    switch(achievementType) {
      case 'badge_earned':
        title = `New Badge: ${achievementDetails.badgeName}`;
        message = `Congratulations! You've earned the ${achievementDetails.badgeName} badge. ${achievementDetails.description}`;
        break;
      case 'level_up':
        title = `Level Up: ${achievementDetails.newLevel}`;
        message = `You've reached level ${achievementDetails.newLevel}! ${achievementDetails.description}`;
        break;
      case 'milestone':
        title = `Milestone Reached: ${achievementDetails.milestoneName}`;
        message = `You've reached the milestone: ${achievementDetails.milestoneName}. ${achievementDetails.description}`;
        break;
      case 'points_milestone':
        title = `Points Milestone: ${achievementDetails.points} points`;
        message = `You've reached ${achievementDetails.points} points! ${achievementDetails.description}`;
        break;
      default:
        title = 'New Achievement';
        message = 'Congratulations on your new achievement!';
    }
    
    // Create the notification
    await exports.createNotification({
      type: 'achievement',
      title,
      message,
      recipient: userId,
      relatedType: 'Achievement',
      actionUrl: '/profile/achievements',
      priority: 'high'
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send achievement notification:', error);
    return false;
  }
};

// Send reminder notifications
exports.sendReminders = async (req, res) => {
  try {
    // Check if user has admin privileges
    if (!req.user.isAdmin) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Unauthorized access to send reminders'
      });
    }
    
    const { type, communityId, message } = req.body;
    let count = 0;
    
    switch(type) {
      case 'pending_issues':
        // Find issues pending for more than 48 hours
        const pendingIssues = await Issue.find({
          status: 'pending',
          updatedAt: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) }
        }).populate('assignedTo');
        
        // Send reminders to assigned users
        for (const issue of pendingIssues) {
          if (issue.assignedTo) {
            await exports.createNotification({
              type: 'reminder',
              title: 'Pending Issue Reminder',
              message: message || `Reminder: The issue "${issue.title}" has been pending for over 48 hours.`,
              recipient: issue.assignedTo._id,
              relatedId: issue._id,
              relatedType: 'Issue',
              actionUrl: `/issues/${issue._id}`,
              priority: 'high'
            });
            count++;
          }
        }
        break;
        
      case 'upcoming_projects':
        // Find projects starting in the next 24 hours
        const upcomingProjects = await Project.find({
          startDate: {
            $gt: new Date(),
            $lt: new Date(Date.now() + 24 * 60 * 60 * 1000)
          }
        }).populate('participants');
        
        // Send reminders to participants
        for (const project of upcomingProjects) {
          for (const participant of project.participants) {
            await exports.createNotification({
              type: 'reminder',
              title: 'Project Starting Soon',
              message: message || `Reminder: The project "${project.name}" is starting in less than 24 hours.`,
              recipient: participant._id,
              relatedId: project._id,
              relatedType: 'Project',
              actionUrl: `/projects/${project._id}`,
              priority: 'normal'
            });
            count++;
          }
        }
        break;
        
      case 'inactive_users':
        // Find users in specific community who haven't logged in for 14 days
        const query = {
          lastLoginDate: { $lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
        };
        
        // Add community filter if provided
        if (communityId) {
          query.communities = communityId;
        }
        
        const inactiveUsers = await User.find(query);
        
        // Send reminders to inactive users
        for (const user of inactiveUsers) {
          await exports.createNotification({
            type: 'reminder',
            title: 'We Miss You!',
            message: message || 'It\'s been a while since you visited. Check out what\'s happening in your community!',
            recipient: user._id,
            relatedType: 'General',
            actionUrl: '/',
            priority: 'normal'
          });
          count++;
        }
        break;
        
      default:
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Invalid reminder type'
        });
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: `Successfully sent ${count} reminder notifications`,
      data: { count }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to send reminder notifications',
      error: error.message
    });
  }
};

// Get notification statistics (for admin)
exports.getNotificationStats = async (req, res) => {
  try {
    // Check if user has admin privileges
    if (!req.user.isAdmin) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Unauthorized access to notification statistics'
      });
    }
    
    // Get notification counts by type
    const typeStats = await Notification.aggregate([
      { $group: {
          _id: '$type',
          count: { $sum: 1 },
          readCount: { 
            $sum: { $cond: [{ $eq: ['$read', true] }, 1, 0] } 
          }
        }
      },
      { $project: {
          type: '$_id',
          count: 1,
          readCount: 1,
          readPercentage: {
            $multiply: [
              { $divide: ['$readCount', '$count'] },
              100
            ]
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get daily notification counts for the past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyCounts = await Notification.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          count: 1,
          _id: 0
        }
      }
    ]);
    
    // Overall stats
    const totalCount = await Notification.countDocuments();
    const readCount = await Notification.countDocuments({ read: true });
    const readPercentage = totalCount > 0 ? (readCount / totalCount * 100).toFixed(2) : 0;
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        overview: {
          totalNotifications: totalCount,
          readCount,
          unreadCount: totalCount - readCount,
          readPercentage
        },
        byType: typeStats,
        dailyCounts
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get notification statistics',
      error: error.message
    });
  }
};

module.exports = exports;