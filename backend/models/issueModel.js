const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const issueSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Issue description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(array) {
          return array && array.length === 2;
        },
        message: 'Coordinates must contain longitude and latitude'
      }
    },
    address: {
      type: String,
      trim: true
    },
    neighborhood: {
      type: Schema.Types.ObjectId,
      ref: 'Neighborhood'
    }
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Issue category is required']
  },
  status: {
    type: String,
    enum: ['reported', 'under_review', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'reported'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  photos: [{
    url: {
      type: String,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter information is required']
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  upvotes: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  downvotes: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: ['reported', 'under_review', 'in_progress', 'resolved', 'closed', 'rejected'],
      required: true
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    note: {
      type: String,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  estimatedCompletionDate: {
    type: Date
  },
  completedDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a 2dsphere index for geospatial queries
issueSchema.index({ 'location.coordinates': '2dsphere' });

// Index for common queries
issueSchema.index({ status: 1, category: 1 });
issueSchema.index({ reporter: 1 });
issueSchema.index({ 'upvotes.user': 1 });
issueSchema.index({ createdAt: -1 });

// Virtual for comment count
issueSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'issue',
  count: true
});

// Virtual for calculating days open
issueSchema.virtual('daysOpen').get(function() {
  if (this.status === 'resolved' || this.status === 'closed') {
    // If completed date exists, calculate from that
    const endDate = this.completedDate || this.updatedAt;
    return Math.floor((endDate - this.createdAt) / (1000 * 60 * 60 * 24));
  } else {
    // Calculate from current date for open issues
    return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
  }
});

// Middleware to add status change to history
issueSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    // If there's no updatedBy field provided, don't add to history
    if (!this._updatedBy) {
      return next();
    }
    
    this.statusHistory.push({
      status: this.status,
      updatedBy: this._updatedBy,
      note: this._statusNote || '',
      timestamp: new Date()
    });
    
    // If status changed to resolved or closed, set completedDate
    if (this.status === 'resolved' || this.status === 'closed') {
      this.completedDate = new Date();
    }
  }
  next();
});

// Method to set the user updating the status
issueSchema.methods.setUpdatedBy = function(userId, note) {
  this._updatedBy = userId;
  this._statusNote = note;
  return this;
};

// Static method to find nearby issues
issueSchema.statics.findNearby = function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

// Method to get upvote count
issueSchema.virtual('upvoteCount').get(function() {
  return this.upvotes.length;
});

// Method to get downvote count
issueSchema.virtual('downvoteCount').get(function() {
  return this.downvotes.length;
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;