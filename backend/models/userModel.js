const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;


notificationSettings: {
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  notifyOnComments: { type: Boolean, default: true },
  notifyOnStatusChange: { type: Boolean, default: true },
  notifyOnNearbyIssues: { type: Boolean, default: true }
},
fcmToken: { type: String },
followedIssues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }]

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: 'default-profile.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  phone: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  badges: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    dateAwarded: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
  reputation: {
    type: Number,
    default: 0
  },
  stats: {
    issuesReported: {
      type: Number,
      default: 0
    },
    issuesResolved: {
      type: Number,
      default: 0
    },
    commentsPosted: {
      type: Number,
      default: 0
    },
    solutionsProposed: {
      type: Number,
      default: 0
    },
    upvotesReceived: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      issueUpdates: {
        type: Boolean,
        default: true
      },
      communityEvents: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      showLocation: {
        type: Boolean,
        default: false
      },
      showContactInfo: {
        type: Boolean,
        default: false
      }
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for geospatial queries
userSchema.index({ "location.coordinates": "2dsphere" });

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords for authentication
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate user level based on reputation
userSchema.methods.getUserLevel = function() {
  if (this.reputation < 100) return 'Newcomer';
  if (this.reputation < 500) return 'Active Citizen';
  if (this.reputation < 1000) return 'Community Builder';
  if (this.reputation < 5000) return 'Local Champion';
  return 'Civic Leader';
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.firstName && this.lastName ? `${this.firstName} ${this.lastName}` : this.username;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
