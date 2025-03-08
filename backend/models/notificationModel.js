/**
 * Notification Model for CivicConnect platform
 * Handles the creation, storage, and management of system notifications
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['alert', 'info', 'success', 'warning', 'error', 'system'],
    default: 'info',
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  url: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['report', 'service', 'account', 'project', 'announcement', 'task'],
    index: true
  },
  metadata: {
    type: Object,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

// Indexes for common queries
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isArchived: 1, createdAt: -1 });

// Methods
NotificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

NotificationSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

// Static methods
NotificationSchema.statics.findUnreadByUser = function(userId) {
  return this.find({
    recipient: userId,
    isRead: false,
    isArchived: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ priority: -1, createdAt: -1 });
};

NotificationSchema.statics.markAllAsReadForUser = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};

// Create the model
const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;