const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  // Basic information
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Visual elements
  icon: {
    type: String,
    required: true, // Font Awesome or custom icon identifier
    default: 'fa-exclamation-circle'
  },
  
  color: {
    type: String,
    required: true,
    default: '#3498db', // Default color in hex
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: props => `${props.value} is not a valid hex color!`
    }
  },
  
  // For category organization
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null // null for top-level categories
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // For displaying in the UI
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // For routing issues to the appropriate department
  departmentResponsible: {
    name: {
      type: String,
      required: false
    },
    email: String,
    phone: String,
    contactPerson: String
  },
  
  // SLA (Service Level Agreement) information
  sla: {
    responseTimeHours: {
      type: Number,
      default: 24 // Default 24 hour response time
    },
    resolutionTimeHours: {
      type: Number,
      default: 72 // Default 72 hour resolution time
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    }
  },
  
  // Custom fields specific to this category of issues
  customFields: [{
    name: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean', 'select', 'multiselect'],
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [String], // For select/multiselect types
    defaultValue: Schema.Types.Mixed,
    helpText: String,
    displayOrder: {
      type: Number,
      default: 0
    }
  }],
  
  // Category statistics
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
    averageResolutionTimeHours: {
      type: Number,
      default: 0
    },
    reportsByMonth: {
      type: Map,
      of: Number,
      default: new Map()
    }
  },
  
  // Required information for this category
  requiredDocumentation: [{
    documentType: {
      type: String,
      required: true
    },
    description: String,
    isRequired: {
      type: Boolean,
      default: false
    }
  }],
  
  // Instructions for this category
  reportingInstructions: {
    type: String,
    trim: true
  },
  
  resolutionSteps: [{
    step: {
      type: String,
      required: true
    },
    description: String,
    estimatedTimeHours: Number
  }],
  
  // For analytics and modeling
  tags: [{
    type: String,
    trim: true
  }],
  
  // Meta fields
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

// Indexes for better query performance
categorySchema.index({ name: 'text', description: 'text', tags: 'text' });
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1, displayOrder: 1 });

// Pre-save hook to generate slug if not provided
categorySchema.pre('save', function(next) {
  if (!this.isModified('name') && this.slug) {
    return next();
  }
  
  this.slug = this.name
    .toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word characters
    .replace(/\-\-+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')         // Trim - from start of text
    .replace(/-+$/, '');        // Trim - from end of text
  
  next();
});

// Virtual for retrieving subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
  options: { sort: { displayOrder: 1 } }
});

// Method to update category statistics
categorySchema.methods.updateStats = async function(openDelta = 0, resolvedDelta = 0, resolutionTime = null) {
  this.stats.openIssues += openDelta;
  this.stats.resolvedIssues += resolvedDelta;
  this.stats.totalIssues = this.stats.openIssues + this.stats.resolvedIssues;
  
  // Update average resolution time
  if (resolutionTime !== null && resolvedDelta > 0) {
    const currentTotalTime = this.stats.averageResolutionTimeHours * (this.stats.resolvedIssues - resolvedDelta);
    const newTotalTime = currentTotalTime + resolutionTime;
    this.stats.averageResolutionTimeHours = newTotalTime / this.stats.resolvedIssues;
  }
  
  // Update monthly statistics
  const currentDate = new Date();
  const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  let currentMonthCount = this.stats.reportsByMonth.get(monthKey) || 0;
  currentMonthCount += openDelta + resolvedDelta;
  this.stats.reportsByMonth.set(monthKey, currentMonthCount);
  
  await this.save();
  return this.stats;
};

// Static method to get categories with subcategories
categorySchema.statics.getHierarchy = async function() {
  const topLevelCategories = await this.find({ parent: null, isActive: true })
    .sort({ displayOrder: 1 })
    .lean();
  
  const populateSubcategories = async (categories) => {
    for (const category of categories) {
      category.subcategories = await this.find({ parent: category._id, isActive: true })
        .sort({ displayOrder: 1 })
        .lean();
      
      if (category.subcategories.length > 0) {
        await populateSubcategories(category.subcategories);
      }
    }
    return categories;
  };
  
  return await populateSubcategories(topLevelCategories);
};

// Method to get all custom fields including those inherited from parent categories
categorySchema.methods.getAllCustomFields = async function() {
  let allFields = [...this.customFields];
  
  // If this category has a parent, get the parent's custom fields too
  if (this.parent) {
    const parentCategory = await this.model('Category').findById(this.parent);
    if (parentCategory) {
      const parentFields = await parentCategory.getAllCustomFields();
      
      // Add parent fields that don't conflict with this category's fields
      const fieldNames = new Set(allFields.map(field => field.name));
      const nonConflictingParentFields = parentFields.filter(field => !fieldNames.has(field.name));
      
      allFields = [...allFields, ...nonConflictingParentFields];
    }
  }
  
  // Sort by display order
  return allFields.sort((a, b) => a.displayOrder - b.displayOrder);
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;