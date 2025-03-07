const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  // The content of the comment
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  
  // Reference to the user who created the comment
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Reference to the issue this comment belongs to
  issue: {
    type: Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  
  // If this is a reply to another comment
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  
  // Track upvotes on the comment
  upvotes: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Track downvotes on the comment
  downvotes: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Track total votes count for easier querying
  voteScore: {
    type: Number,
    default: 0
  },
  
  // Is this comment flagged as a solution to the issue?
  isSolution: {
    type: Boolean,
    default: false
  },
  
  // Has this comment been approved by a moderator? (for moderation features)
  isApproved: {
    type: Boolean,
    default: true
  },
  
  // For tracking if a comment has been flagged as inappropriate
  flags: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'abuse', 'inappropriate', 'off-topic', 'other'],
      required: true
    },
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Media attachments (photos, documents)
  attachments: [{
    fileUrl: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      enum: ['image', 'document', 'video', 'other'],
      required: true
    },
    fileName: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // For edited comments
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editHistory: [{
    content: {
      type: String,
      required: true
    },
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes for better query performance
commentSchema.index({ issue: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ voteScore: -1 });

// Virtual for calculating the total number of votes
commentSchema.virtual('totalVotes').get(function() {
  return this.upvotes.length + this.downvotes.length;
});

// Method to add an upvote
commentSchema.methods.addUpvote = async function(userId) {
  // Check if user already upvoted
  const existingUpvote = this.upvotes.find(vote => vote.user.toString() === userId.toString());
  if (existingUpvote) return false;
  
  // Check if user previously downvoted and remove if needed
  const downvoteIndex = this.downvotes.findIndex(vote => vote.user.toString() === userId.toString());
  if (downvoteIndex > -1) {
    this.downvotes.splice(downvoteIndex, 1);
    this.voteScore += 1; // Remove the downvote effect
  }
  
  // Add the upvote
  this.upvotes.push({ user: userId, createdAt: new Date() });
  this.voteScore += 1;
  await this.save();
  return true;
};

// Method to add a downvote
commentSchema.methods.addDownvote = async function(userId) {
  // Check if user already downvoted
  const existingDownvote = this.downvotes.find(vote => vote.user.toString() === userId.toString());
  if (existingDownvote) return false;
  
  // Check if user previously upvoted and remove if needed
  const upvoteIndex = this.upvotes.findIndex(vote => vote.user.toString() === userId.toString());
  if (upvoteIndex > -1) {
    this.upvotes.splice(upvoteIndex, 1);
    this.voteScore -= 1; // Remove the upvote effect
  }
  
  // Add the downvote
  this.downvotes.push({ user: userId, createdAt: new Date() });
  this.voteScore -= 1;
  await this.save();
  return true;
};

// Method to edit a comment
commentSchema.methods.edit = async function(newContent) {
  // Add current content to edit history
  this.editHistory.push({
    content: this.content,
    editedAt: new Date()
  });
  
  // Update content and mark as edited
  this.content = newContent;
  this.isEdited = true;
  this.updatedAt = new Date();
  
  await this.save();
  return this;
};

// Method to flag a comment
commentSchema.methods.flag = async function(userId, reason, description = '') {
  // Check if user already flagged
  const existingFlag = this.flags.find(flag => flag.user.toString() === userId.toString());
  if (existingFlag) return false;
  
  // Add the flag
  this.flags.push({
    user: userId,
    reason,
    description,
    createdAt: new Date()
  });
  
  await this.save();
  return true;
};

// Pre-remove hook to handle cascading deletes if needed
commentSchema.pre('remove', async function(next) {
  try {
    // Find and remove child comments
    await this.model('Comment').deleteMany({ parentComment: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;