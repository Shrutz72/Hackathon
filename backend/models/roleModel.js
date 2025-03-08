/**
 * Role Model for CivicConnect platform
 * Manages user roles and permissions within the government dashboard
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
  resource: {
    type: String,
    required: true,
    trim: true
  },
  actions: [{
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'assign', 'export', 'import', 'publish'],
    required: true
  }]
});

const RoleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  // System roles cannot be modified or deleted through the UI
  isSystem: {
    type: Boolean,
    default: false
  },
  // Department-specific roles are only applicable within their department
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    index: true
  },
  permissions: [PermissionSchema],
  // Access level determines UI options and high-level access patterns
  accessLevel: {
    type: Number,
    min: 0,  // Public/Citizen access
    max: 100, // System Administrator
    default: 10,
    index: true
  },
  // Hierarchy for role inheritance and organization chart
  parentRole: {
    type: Schema.Types.ObjectId,
    ref: 'Role'
  },
  // Metadata
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // For audit trail
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index to ensure uniqueness of department-specific roles
RoleSchema.index({ name: 1, departmentId: 1 }, { unique: true, sparse: true });

// Methods

// Check if role has specific permission
RoleSchema.methods.hasPermission = function(resource, action) {
  return this.permissions.some(permission => 
    permission.resource === resource && 
    permission.actions.includes(action)
  );
};

// Add a permission to the role
RoleSchema.methods.addPermission = function(resource, actions) {
  const existingPermission = this.permissions.find(p => p.resource === resource);
  
  if (existingPermission) {
    // Add only new actions
    actions.forEach(action => {
      if (!existingPermission.actions.includes(action)) {
        existingPermission.actions.push(action);
      }
    });
  } else {
    // Create new permission
    this.permissions.push({ resource, actions });
  }
  
  return this.save();
};

// Remove a permission from the role
RoleSchema.methods.removePermission = function(resource, actions) {
  const permissionIndex = this.permissions.findIndex(p => p.resource === resource);
  
  if (permissionIndex !== -1) {
    if (actions && actions.length > 0) {
      // Remove specific actions
      this.permissions[permissionIndex].actions = 
        this.permissions[permissionIndex].actions.filter(a => !actions.includes(a));
      
      // Remove the permission entirely if no actions remain
      if (this.permissions[permissionIndex].actions.length === 0) {
        this.permissions.splice(permissionIndex, 1);
      }
    } else {
      // Remove the entire permission
      this.permissions.splice(permissionIndex, 1);
    }
  }
  
  return this.save();
};

// Static methods

// Find roles by access level range
RoleSchema.statics.findByAccessLevel = function(minLevel, maxLevel) {
  return this.find({
    accessLevel: { $gte: minLevel, $lte: maxLevel }
  }).sort({ accessLevel: -1 });
};

// Get all permissions for a specific resource
RoleSchema.statics.getResourcePermissions = function(resource) {
  return this.aggregate([
    { $unwind: '$permissions' },
    { $match: { 'permissions.resource': resource } },
    { $project: {
        roleName: '$name',
        actions: '$permissions.actions',
        accessLevel: 1
      }
    },
    { $sort: { accessLevel: -1 } }
  ]);
};

// Create default system roles
RoleSchema.statics.createDefaultRoles = async function() {
  const defaults = [
    {
      name: 'System Administrator',
      description: 'Full access to all system features and settings',
      isSystem: true,
      accessLevel: 100,
      permissions: [
        { resource: '*', actions: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'assign', 'export', 'import', 'publish'] }
      ]
    },
    {
      name: 'Department Administrator',
      description: 'Administrative access limited to department resources',
      isSystem: true,
      accessLevel: 80,
      permissions: [
        { resource: 'department.*', actions: ['create', 'read', 'update', 'delete', 'approve', 'assign'] },
        { resource: 'user', actions: ['read', 'update'] },
        { resource: 'report', actions: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'assign'] }
      ]
    },
    {
      name: 'Staff',
      description: 'Regular staff with operational access',
      isSystem: true,
      accessLevel: 50,
      permissions: [
        { resource: 'report', actions: ['create', 'read', 'update', 'assign'] },
        { resource: 'dashboard', actions: ['read'] },
        { resource: 'notification', actions: ['read'] }
      ]
    },
    {
      name: 'Citizen',
      description: 'Public user with limited access',
      isSystem: true,
      accessLevel: 10,
      permissions: [
        { resource: 'report', actions: ['create', 'read'] },
        { resource: 'profile', actions: ['read', 'update'] }
      ]
    }
  ];

  const operations = defaults.map(role => ({
    updateOne: {
      filter: { name: role.name },
      update: { $setOnInsert: role },
      upsert: true
    }
  }));

  return this.bulkWrite(operations);
};

// Create the model
const Role = mongoose.model('Role', RoleSchema);

module.exports = Role;