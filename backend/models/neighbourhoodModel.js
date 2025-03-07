const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const neighbourhoodSchema = new Schema({
  // Basic information
  name: {
    type: String,
    required: [true, 'Neighbourhood name is required'],
    trim: true,
    unique: true
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Geographic information
  geometry: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true,
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // GeoJSON Polygon format
      required: true
    }
  },
  
  // For displaying on maps
  center: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  
  // Administrative details
  city: {
    type: String,
    required: true,
    trim: true
  },
  
  state: {
    type: String,
    required: true,
    trim: true
  },
  
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'USA'
  },
  
  zipCodes: [{
    type: String,
    trim: true
  }],
  
  // Reference to admins/moderators for this neighbourhood
  moderators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Users who have joined/subscribed to this neighbourhood
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['resident', 'business', 'government', 'visitor'],
      default: 'resident'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Statistics
  stats: {
    totalIssues: {
      type: Number,
      default: 0
    },
    openIssues: {
      type: Number,
      default: 0
    },
    resolvedIssues: {
      type: Number,
      default: 0
    },
    totalMembers: {
      type: Number,
      default: 0
    },
    participationRate: {
      type: Number,
      default: 0 // Percentage of members actively reporting or solving issues
    }
  },
  
  // Neighborhood level attributes
  safetyIndex: {
    type: Number,
    min: 0,
    max: 100,
    default: 50 // 0-100 scale
  },
  
  cleanlinesssIndex: {
    type: Number,
    min: 0,
    max: 100,
    default: 50 // 0-100 scale
  },
  
  infrastructureIndex: {
    type: Number,
    min: 0,
    max: 100,
    default: 50 // 0-100 scale
  },
  
  // Common issue categories in this neighbourhood
  commonIssueCategories: [{
    category: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  
  // Special local initiatives
  initiatives: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['planned', 'active', 'completed', 'cancelled'],
      default: 'planned'
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    participants: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number] // [longitude, latitude]
      },
      address: String
    }
  }],
  
  // Emergency contact information for this neighbourhood
  emergencyContacts: [{
    name: {
      type: String,
      required: true
    },
    role: String,
    phone: String,
    email: String,
    available24Hours: {
      type: Boolean,
      default: false
    }
  }],
  
  // Local resources like libraries, community centers
  localResources: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['government', 'healthcare', 'education', 'recreation', 'shopping', 'services', 'other'],
      required: true
    },
    description: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number] // [longitude, latitude]
      },
      address: String
    },
    contactInfo: {
      phone: String,
      email: String,
      website: String
    },
    operatingHours: String
  }],
  
  // Media
  photos: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  coverImage: {
    type: String,
    default: 'default-neighbourhood-cover.jpg'
  },
  
  // Meta fields
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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

// Indexes for geospatial queries
neighbourhoodSchema.index({ geometry: '2dsphere' });
neighbourhoodSchema.index({ center: '2dsphere' });
neighbourhoodSchema.index({ name: 'text', description: 'text' });

// Virtual for total members count
neighbourhoodSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Method to check if a point is within the neighbourhood
neighbourhoodSchema.methods.containsPoint = function(longitude, latitude) {
  // This uses MongoDB's geoIntersects to check if the point is within the polygon
  const point = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
  
  // Using MongoDB's $geoIntersects in a static context
  return this.constructor.findOne({
    _id: this._id,
    geometry: {
      $geoIntersects: {
        $geometry: point
      }
    }
  }).then(result => !!result);
};

// Method to add a member
neighbourhoodSchema.methods.addMember = async function(userId, role = 'resident') {
  // Check if user is already a member
  const existingMember = this.members.find(member => member.user.toString() === userId.toString());
  if (existingMember) return false;
  
  // Add the member
  this.members.push({
    user: userId,
    role,
    joinedAt: new Date()
  });
  
  // Update stats
  this.stats.totalMembers = this.members.length;
  
  await this.save();
  return true;
};

// Method to remove a member
neighbourhoodSchema.methods.removeMember = async function(userId) {
  const memberIndex = this.members.findIndex(member => member.user.toString() === userId.toString());
  if (memberIndex === -1) return false;
  
  // Remove the member
  this.members.splice(memberIndex, 1);
  
  // Update stats
  this.stats.totalMembers = this.members.length;
  
  await this.save();
  return true;
};

// Method to update issue statistics
neighbourhoodSchema.methods.updateIssueStats = async function(openDelta = 0, resolvedDelta = 0) {
  this.stats.openIssues += openDelta;
  this.stats.resolvedIssues += resolvedDelta;
  this.stats.totalIssues = this.stats.openIssues + this.stats.resolvedIssues;
  
  await this.save();
  return this.stats;
};

// Method to add an initiative
neighbourhoodSchema.methods.addInitiative = async function(initiativeData) {
  this.initiatives.push(initiativeData);
  await this.save();
  return this.initiatives[this.initiatives.length - 1];
};

// Method to calculate neighborhood quality indexes based on reported issues
neighbourhoodSchema.methods.recalculateIndexes = async function() {
  // This would typically be a complex calculation based on:
  // - Number and types of issues reported
  // - Resolution times
  // - User satisfaction ratings
  // - etc.
  
  // For now, we'll use a simplified placeholder implementation
  const Issue = mongoose.model('Issue');
  
  try {
    // Get all issues in this neighborhood
    const issues = await Issue.find({ 
      'location.coordinates': {
        $geoWithin: {
          $geometry: this.geometry
        }
      }
    });
    
    if (!issues.length) return;
    
    // Count issues by category
    const categoryCounts = {};
    issues.forEach(issue => {
      if (!categoryCounts[issue.category]) {
        categoryCounts[issue.category] = 0;
      }
      categoryCounts[issue.category]++;
    });
    
    // Update common issue categories
    this.commonIssueCategories = Object.keys(categoryCounts).map(category => ({
      category,
      count: categoryCounts[category]
    })).sort((a, b) => b.count - a.count);
    
    // Calculate safety index (example logic)
    const safetyIssues = issues.filter(issue => 
      ['crime', 'safety', 'lighting', 'hazard'].includes(issue.category)
    );
    const resolvedSafetyIssues = safetyIssues.filter(issue => issue.status === 'resolved');
    this.safetyIndex = safetyIssues.length 
      ? Math.min(100, Math.max(0, (resolvedSafetyIssues.length / safetyIssues.length) * 100))
      : 80; // Default if no safety issues
    
    // Calculate cleanliness index (example logic)
    const cleanlinessIssues = issues.filter(issue => 
      ['trash', 'pollution', 'graffiti', 'cleanliness'].includes(issue.category)
    );
    const resolvedCleanlinessIssues = cleanlinessIssues.filter(issue => issue.status === 'resolved');
    this.cleanlinesssIndex = cleanlinessIssues.length 
      ? Math.min(100, Math.max(0, (resolvedCleanlinessIssues.length / cleanlinessIssues.length) * 100))
      : 80; // Default if no cleanliness issues
    
    // Calculate infrastructure index (example logic)
    const infrastructureIssues = issues.filter(issue => 
      ['roads', 'streets', 'utilities', 'public_services', 'facilities'].includes(issue.category)
    );
    const resolvedInfrastructureIssues = infrastructureIssues.filter(issue => issue.status === 'resolved');
    this.infrastructureIndex = infrastructureIssues.length 
      ? Math.min(100, Math.max(0, (resolvedInfrastructureIssues.length / infrastructureIssues.length) * 100))
      : 80; // Default if no infrastructure issues
    
    // Calculate participation rate
    const uniqueParticipants = new Set();
    issues.forEach(issue => {
      uniqueParticipants.add(issue.reportedBy.toString());
      issue.comments.forEach(comment => {
        uniqueParticipants.add(comment.author.toString());
      });
    });
    
    this.stats.participationRate = this.members.length 
      ? Math.min(100, (uniqueParticipants.size / this.members.length) * 100)
      : 0;
    
    await this.save();
    return {
      safetyIndex: this.safetyIndex,
      cleanlinesssIndex: this.cleanlinesssIndex,
      infrastructureIndex: this.infrastructureIndex
    };
  } catch (error) {
    console.error('Error recalculating neighborhood indexes:', error);
    throw error;
  }
};

const Neighbourhood = mongoose.model('Neighbourhood', neighbourhoodSchema);

module.exports = Neighbourhood;