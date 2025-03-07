/**
 * notificationUtils.js - Notification utility functions for community reporting platform
 * Handles creation, delivery, and management of notifications for issue updates,
 * community activities, and user interactions
 */

const mongoose = require('mongoose');
const Notification = require('../models/Notification'); // Assumes you have this model
const User = require('../models/User'); // Assumes you have this model
const Issue = require('../models/Issue'); // Assumes you have this model

/**
 * Notification types enum
 */
const NOTIFICATION_TYPES = {
  ISSUE_STATUS_CHANGE: 'issue_status_change',
  ISSUE_COMMENT: 'issue_comment',
  ISSUE_UPVOTE: 'issue_upvote',
  COMMUNITY_EVENT: 'community_event',
  ISSUE_RESOLVED: 'issue_resolved',
  ISSUE_ASSIGNED: 'issue_assigned',
  BADGE_EARNED: 'badge_earned',
  OFFICIAL_RESPONSE: 'official_response',
  SOLUTION_PROPOSED: 'solution_proposed',
  NEARBY_ISSUE: 'nearby_issue'
};

/**
 * Notification priorities enum
 */
const NOTIFICATION_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * Creates a notification for issue status changes
 * @param {String} issueId - ID of the issue
 * @param {String} previousStatus - Previous status
 * @param {String} newStatus - New status
 * @param {String} updatedBy - ID of the user who updated the status
 * @returns {Promise<Object>} Created notification
 */
const createStatusChangeNotification = async (issueId, previousStatus, newStatus, updatedBy) => {
  try {
    const issue = await Issue.findById(issueId).populate('reportedBy');
    
    if (!issue) {
      throw new Error('Issue not found');
    }
    
    // Create notification for the issue reporter
    const notification = new Notification({
      recipient: issue.reportedBy._id,
      type: NOTIFICATION_TYPES.ISSUE_STATUS_CHANGE,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      data: {
        issueId,
        issueTitle: issue.title,
        previousStatus,
        newStatus,
        updatedBy,
        timestamp: new Date()
      },
      read: false
    });
    
    await notification.save();
    
    // Also notify users who subscribed to this issue
    await notifySubscribers(issueId, {
      type: NOTIFICATION_TYPES.ISSUE_STATUS_CHANGE,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      title: `Status Update: ${issue.title}`,
      message: `The status has changed from ${previousStatus} to ${newStatus}`,
      data: {
        issueId,
        issueTitle: issue.title,
        previousStatus,
        newStatus,
        updatedBy,
        timestamp: new Date()
      }
    }, [issue.reportedBy._id]); // exclude the original reporter who already got notified
    
    return notification;
  } catch (error) {
    console.error('Error creating status change notification:', error);
    throw error;
  }
};

/**
 * Creates a notification for new comments on an issue
 * @param {String} issueId - ID of the issue
 * @param {String} commentId - ID of the new comment
 * @param {String} commentBy - ID of the user who made the comment
 * @param {String} commentText - Preview of the comment text
 * @returns {Promise<Object>} Created notification
 */
const createCommentNotification = async (issueId, commentId, commentBy, commentText) => {
  try {
    const issue = await Issue.findById(issueId).populate('reportedBy');
    const commenter = await User.findById(commentBy, 'name username');
    
    if (!issue || !commenter) {
      throw new Error('Issue or commenter not found');
    }
    
    // Don't notify the commenter about their own comment
    if (issue.reportedBy._id.toString() !== commentBy.toString()) {
      // Create notification for issue reporter
      const notification = new Notification({
        recipient: issue.reportedBy._id,
        type: NOTIFICATION_TYPES.ISSUE_COMMENT,
        priority: NOTIFICATION_PRIORITIES.MEDIUM,
        data: {
          issueId,
          issueTitle: issue.title,
          commentId,
          commentBy: commenter._id,
          commenterName: commenter.name || commenter.username,
          commentPreview: commentText.substring(0, 100),
          timestamp: new Date()
        },
        read: false
      });
      
      await notification.save();
    }
    
    // Notify subscribers except the commenter
    await notifySubscribers(issueId, {
      type: NOTIFICATION_TYPES.ISSUE_COMMENT,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      title: `New Comment on: ${issue.title}`,
      message: `${commenter.name || commenter.username} commented: ${commentText.substring(0, 100)}${commentText.length > 100 ? '...' : ''}`,
      data: {
        issueId,
        issueTitle: issue.title,
        commentId,
        commentBy: commenter._id,
        commenterName: commenter.name || commenter.username,
        timestamp: new Date()
      }
    }, [commentBy]); // exclude the commenter
    
    return { success: true };
  } catch (error) {
    console.error('Error creating comment notification:', error);
    throw error;
  }
};

/**
 * Creates a notification for when an issue is resolved
 * @param {String} issueId - ID of the resolved issue
 * @param {String} resolvedBy - ID of the user who resolved the issue
 * @param {String} resolutionNote - Note about how it was resolved
 * @returns {Promise<Object>} Created notification
 */
const createResolutionNotification = async (issueId, resolvedBy, resolutionNote) => {
  try {
    const issue = await Issue.findById(issueId).populate('reportedBy');
    const resolver = await User.findById(resolvedBy, 'name username isOfficial');
    
    if (!issue) {
      throw new Error('Issue not found');
    }
    
    // Create notification for the issue reporter
    const notification = new Notification({
      recipient: issue.reportedBy._id,
      type: NOTIFICATION_TYPES.ISSUE_RESOLVED,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      data: {
        issueId,
        issueTitle: issue.title,
        resolvedBy: resolver ? resolver._id : null,
        resolverName: resolver ? (resolver.name || resolver.username) : 'System',
        isOfficialResolution: resolver ? resolver.isOfficial : false,
        resolutionNote,
        timestamp: new Date()
      },
      read: false
    });
    
    await notification.save();
    
    // Notify all subscribers about resolution
    await notifySubscribers(issueId, {
      type: NOTIFICATION_TYPES.ISSUE_RESOLVED,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title: `Issue Resolved: ${issue.title}`,
      message: resolutionNote || `This issue has been marked as resolved${resolver ? ' by ' + (resolver.name || resolver.username) : ''}.`,
      data: {
        issueId,
        issueTitle: issue.title,
        resolvedBy: resolver ? resolver._id : null,
        resolverName: resolver ? (resolver.name || resolver.username) : 'System',
        isOfficialResolution: resolver ? resolver.isOfficial : false,
        timestamp: new Date()
      }
    }, [issue.reportedBy._id]); // exclude original reporter who already got notified
    
    return notification;
  } catch (error) {
    console.error('Error creating resolution notification:', error);
    throw error;
  }
};

/**
 * Creates a notification about a new badge earned
 * @param {String} userId - ID of the user who earned the badge
 * @param {String} badgeId - ID of the badge earned
 * @param {String} badgeName - Name of the badge
 * @param {String} badgeDescription - Description of the badge
 * @returns {Promise<Object>} Created notification
 */
const createBadgeNotification = async (userId, badgeId, badgeName, badgeDescription) => {
  try {
    const notification = new Notification({
      recipient: userId,
      type: NOTIFICATION_TYPES.BADGE_EARNED,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      data: {
        badgeId,
        badgeName,
        badgeDescription,
        timestamp: new Date()
      },
      read: false
    });
    
    await notification.save();
    
    return notification;
  } catch (error) {
    console.error('Error creating badge notification:', error);
    throw error;
  }
};

/**
 * Creates a notification about nearby issues
 * @param {String} userId - ID of the user to notify
 * @param {String} issueId - ID of the nearby issue
 * @param {Number} distance - Distance to the issue in kilometers
 * @returns {Promise<Object>} Created notification
 */
const createNearbyIssueNotification = async (userId, issueId, distance) => {
  try {
    const issue = await Issue.findById(issueId);
    
    if (!issue) {
      throw new Error('Issue not found');
    }
    
    // Check if user already has a notification for this issue
    const existingNotification = await Notification.findOne({
      recipient: userId,
      type: NOTIFICATION_TYPES.NEARBY_ISSUE,
      'data.issueId': issueId,
      createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Within the last 7 days
    });
    
    if (existingNotification) {
      // Don't spam with duplicate notifications for the same nearby issue
      return { skipped: true, reason: 'Already notified recently' };
    }
    
    const notification = new Notification({
      recipient: userId,
      type: NOTIFICATION_TYPES.NEARBY_ISSUE,
      priority: NOTIFICATION_PRIORITIES.LOW,
      data: {
        issueId,
        issueTitle: issue.title,
        issueCategory: issue.category,
        distance: distance.toFixed(1),
        timestamp: new Date()
      },
      read: false
    });
    
    await notification.save();
    
    return notification;
  } catch (error) {
    console.error('Error creating nearby issue notification:', error);
    throw error;
  }
};

/**
 * Creates a notification about an official response
 * @param {String} issueId - ID of the issue
 * @param {String} responseId - ID of the official response
 * @param {String} responderId - ID of the official responder
 * @param {String} responseText - Preview of the response
 * @returns {Promise<Object>} Created notification
 */
const createOfficialResponseNotification = async (issueId, responseId, responderId, responseText) => {
  try {
    const issue = await Issue.findById(issueId).populate('reportedBy');
    const responder = await User.findById(responderId, 'name username department');
    
    if (!issue || !responder) {
      throw new Error('Issue or responder not found');
    }
    
    // Create notification for the issue reporter
    const notification = new Notification({
      recipient: issue.reportedBy._id,
      type: NOTIFICATION_TYPES.OFFICIAL_RESPONSE,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      data: {
        issueId,
        issueTitle: issue.title,
        responseId,
        responderId,
        responderName: responder.name || responder.username,
        responderDepartment: responder.department,
        responsePreview: responseText.substring(0, 100),
        timestamp: new Date()
      },
      read: false
    });
    
    await notification.save();
    
    // Notify all subscribers
    await notifySubscribers(issueId, {
      type: NOTIFICATION_TYPES.OFFICIAL_RESPONSE,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title: `Official Response: ${issue.title}`,
      message: `${responder.department || 'An official'} has responded to this issue`,
      data: {
        issueId,
        issueTitle: issue.title,
        responseId,
        responderId,
        responderName: responder.name || responder.username,
        responderDepartment: responder.department,
        timestamp: new Date()
      }
    }, [issue.reportedBy._id]); // exclude original reporter who already got notified
    
    return notification;
  } catch (error) {
    console.error('Error creating official response notification:', error);
    throw error;
  }
};

/**
 * Creates a notification about a community event
 * @param {String} eventId - ID of the event
 * @param {String} eventTitle - Title of the event
 * @param {Date} eventDate - Date of the event
 * @param {String} eventLocation - Location of the event
 * @param {Array<String>} recipientIds - IDs of users to notify
 * @returns {Promise<Object>} Result of the operation
 */
const createCommunityEventNotification = async (eventId, eventTitle, eventDate, eventLocation, recipientIds) => {
  try {
    const notifications = recipientIds.map(userId => ({
      recipient: userId,
      type: NOTIFICATION_TYPES.COMMUNITY_EVENT,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      data: {
        eventId,
        eventTitle,
        eventDate,
        eventLocation,
        timestamp: new Date()
      },
      read: false
    }));
    
    await Notification.insertMany(notifications);
    
    return { success: true, count: notifications.length };
  } catch (error) {
    console.error('Error creating community event notifications:', error);
    throw error;
  }
};

/**
 * Notifies all subscribers of an issue
 * @param {String} issueId - ID of the issue
 * @param {Object} notificationData - Notification data
 * @param {Array<String>} excludeUserIds - Array of user IDs to exclude from notifications
 * @returns {Promise<Object>} Result of the operation
 */
const notifySubscribers = async (issueId, notificationData, excludeUserIds = []) => {
  try {
    const issue = await Issue.findById(issueId);
    
    if (!issue || !issue.subscribers || issue.subscribers.length === 0) {
      return { success: true, count: 0 };
    }
    
    // Filter out excluded users
    const recipients = issue.subscribers.filter(
      subscriberId => !excludeUserIds.includes(subscriberId.toString())
    );
    
    if (recipients.length === 0) {
      return { success: true, count: 0 };
    }
    
    const notifications = recipients.map(userId => ({
      recipient: userId,
      type: notificationData.type,
      priority: notificationData.priority,
      data: {
        ...notificationData.data,
        title: notificationData.title,
        message: notificationData.message
      },
      read: false
    }));
    
    await Notification.insertMany(notifications);
    
    return { success: true, count: notifications.length };
  } catch (error) {
    console.error('Error notifying subscribers:', error);
    throw error;
  }
};

/**
 * Gets unread notifications for a user
 * @param {String} userId - ID of the user
 * @param {Number} limit - Maximum number of notifications to retrieve
 * @returns {Promise<Array>} Array of notifications
 */
const getUnreadNotifications = async (userId, limit = 20) => {
  try {
    return await Notification.find({
      recipient: userId,
      read: false
    })
    .sort({ createdAt: -1 })
    .limit(limit);
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    throw error;
  }
};

/**
 * Marks notifications as read
 * @param {String} userId - ID of the user
 * @param {Array<String>} notificationIds - IDs of notifications to mark as read
 * @returns {Promise<Object>} Result of the operation
 */
const markNotificationsAsRead = async (userId, notificationIds) => {
  try {
    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipient: userId // Security check to ensure user owns these notifications
      },
      {
        $set: { read: true, readAt: new Date() }
      }
    );
    
    return { success: true, count: result.modifiedCount };
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
};

/**
 * Gets the count of unread notifications for a user
 * @param {String} userId - ID of the user
 * @returns {Promise<Number>} Count of unread notifications
 */
const getUnreadCount = async (userId) => {
  try {
    return await Notification.countDocuments({
      recipient: userId,
      read: false
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

/**
 * Deletes old notifications
 * @param {Number} daysToKeep - Number of days to keep notifications
 * @returns {Promise<Object>} Result of the operation
 */
const cleanupOldNotifications = async (daysToKeep = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      // Optionally only delete read notifications
      // read: true
    });
    
    return { success: true, count: result.deletedCount };
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    throw error;
  }
};

module.exports = {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  createStatusChangeNotification,
  createCommentNotification,
  createResolutionNotification,
  createBadgeNotification,
  createNearbyIssueNotification,
  createOfficialResponseNotification,
  createCommunityEventNotification,
  notifySubscribers,
  getUnreadNotifications,
  markNotificationsAsRead,
  getUnreadCount,
  cleanupOldNotifications
};