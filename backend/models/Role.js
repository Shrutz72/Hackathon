const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    enum: ['user', 'moderator', 'admin', 'municipal_worker', 'government_official'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Role description is required']
  },
  permissions: [{
    type: String,
    trim: true,
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-defined roles and their permissions
roleSchema.statics.defaultRoles = [
  {
    name: 'user',
    description: 'Regular platform user who can report and track issues',
    permissions: [
      'report:issue', 
      'comment:create', 
      'comment:own:edit', 
      'issue:own:edit', 
      'issue:view', 
      'issue:follow',
      'profile:own:edit'
    ]
  },
  {
    name: 'moderator',
    description: 'Community moderator who can verify issues and manage content',
    permissions: [
      'report:issue', 
      'comment:create', 
      'comment:edit', 
      'comment:delete', 
      'issue:verify', 
      'issue:edit', 
      'issue:categorize',
      'user:report'
    ]
  },
  {
    name: 'municipal_worker',
    description: 'Local government worker who can update issue statuses',
    permissions: [
      'issue:status:update', 
      'issue:assign', 
      'issue:resolve', 
      'issue:comment:official'
    ]
  },
  {
    name: 'government_official',
    description: 'Government representative with advanced platform privileges',
    permissions: [
      'issue:priority:set',
      'issue:official:response',
      'report:generate',
      'resource:allocate'
    ]
  },
  {
    name: 'admin',
    description: 'Platform administrator with full access',
    permissions: ['all']
  }
];

// Method to initialize default roles
roleSchema.statics.initializeRoles = async function() {
  try {
    const count = await this.countDocuments();
    
    // Only create default roles if none exist
    if (count === 0) {
      await this.insertMany(this.defaultRoles);
      console.log('Default roles initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing default roles:', error);
  }
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;