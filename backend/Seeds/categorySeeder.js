const mongoose = require('mongoose');
const Category = require('../models/Category'); // Assuming you have a Category model
const colors = require('../config/colors'); // Optional: import colors from a config file

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/community-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define your categories with relevant information
const categories = [
  {
    name: 'Roads',
    description: 'Issues related to road conditions, potholes, traffic signals, signs, etc.',
    icon: 'road',
    color: colors?.road || '#FF9800', // Orange
    subcategories: ['Potholes', 'Road Damage', 'Traffic Signals', 'Street Signs', 'Sidewalks']
  },
  {
    name: 'Waste',
    description: 'Issues related to waste collection, illegal dumping, litter, etc.',
    icon: 'trash',
    color: colors?.waste || '#4CAF50', // Green
    subcategories: ['Illegal Dumping', 'Missed Collection', 'Public Bins', 'Recycling Issues']
  },
  {
    name: 'Electricity',
    description: 'Issues related to streetlights, power outages, electrical hazards, etc.',
    icon: 'lightbulb',
    color: colors?.electricity || '#FFEB3B', // Yellow
    subcategories: ['Streetlight Outage', 'Damaged Electrical Box', 'Power Lines', 'Public Charging Stations']
  },
  {
    name: 'Water',
    description: 'Issues related to water services, leaks, flooding, drainage, etc.',
    icon: 'water',
    color: colors?.water || '#2196F3', // Blue
    subcategories: ['Water Main Break', 'Flooding', 'Drainage Issues', 'Water Quality', 'Fire Hydrants']
  },
  {
    name: 'Public Spaces',
    description: 'Issues related to parks, public buildings, graffiti, etc.',
    icon: 'park',
    color: colors?.publicSpaces || '#8BC34A', // Light Green
    subcategories: ['Park Maintenance', 'Graffiti', 'Public Benches', 'Playground Equipment', 'Public Art']
  },
  {
    name: 'Public Safety',
    description: 'Issues related to safety concerns, broken fences, dangerous areas, etc.',
    icon: 'shield',
    color: colors?.publicSafety || '#F44336', // Red
    subcategories: ['Street Safety', 'Dangerous Conditions', 'Missing Guardrails', 'Abandoned Vehicles']
  },
  {
    name: 'Wildlife',
    description: 'Issues related to wildlife, pests, animal control, etc.',
    icon: 'paw',
    color: colors?.wildlife || '#795548', // Brown
    subcategories: ['Animal Control', 'Pest Problems', 'Wildlife Rescue', 'Habitat Concerns']
  },
  {
    name: 'Other',
    description: 'Any other issues not falling under the defined categories.',
    icon: 'ellipsis-h',
    color: colors?.other || '#9E9E9E', // Gray
    subcategories: ['General Concerns', 'Suggestions', 'Improvements', 'Miscellaneous']
  }
];

// Seed the database with categories
const seedCategories = async () => {
  try {
    // First, clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Seeded ${createdCategories.length} categories successfully`);

    return createdCategories;
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};

// Run the seeder
const runSeeder = async () => {
  try {
    await connectDB();
    await seedCategories();
    console.log('Category seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error running seeder:', error);
    process.exit(1);
  }
};

// Execute the seeder if this file is run directly
if (require.main === module) {
  runSeeder();
}

// Export for use in other seeders
module.exports = {
  seedCategories,
  categories
};