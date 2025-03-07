const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Assuming you have a User model
const Role = require('../models/Role'); // Assuming you have a Role model for role-based access

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

// Define admin users
const adminUsers = [
  {
    fullName: 'System Administrator',
    email: 'admin@communityplatform.com',
    password: 'admin123', // This will be hashed before saving
    phoneNumber: '+1234567890',
    isEmailVerified: true,
    isPhoneVerified: true,
    role: 'admin',
    department: 'IT',
    position: 'System Administrator',
    bio: 'Main administrator account for the Community Reporting Platform.'
  },
  {
    fullName: 'Municipality Manager',
    email: 'manager@communityplatform.com',
    password: 'manager123', // This will be hashed before saving
    phoneNumber: '+1987654321',
    isEmailVerified: true,
    isPhoneVerified: true,
    role: 'admin',
    department: 'Municipal Services',
    position: 'Community Manager',
    bio: 'Responsible for overseeing community reports and coordinating responses.'
  }
];

// Ensure admin role exists
const ensureRoles = async () => {
  try {
    // Define basic roles if using a Role model
    const roles = [
      { name: 'admin', description: 'Full access to all features and data', permissions: ['all'] },
      { name: 'moderator', description: 'Can review and manage reports', permissions: ['manage_reports', 'view_dashboard'] },
      { name: 'user', description: 'Regular user who can submit reports', permissions: ['submit_reports', 'view_own_reports'] }
    ];

    // Check if Role model exists and create roles
    if (mongoose.models.Role) {
      // Clear existing roles (optional, you might want to keep them and just update)
      await Role.deleteMany({});
      
      // Create new roles
      const createdRoles = await Role.insertMany(roles);
      console.log(`Created ${createdRoles.length} roles`);
      
      return createdRoles;
    } else {
      console.log('No Role model found. Skipping role creation.');
      return null;
    }
  } catch (error) {
    console.error('Error ensuring roles:', error);
    throw error;
  }
};

// Seed the database with admin users
const seedAdmins = async () => {
  try {
    // First, check if we already have admin users to avoid duplicates
    const existingAdminCount = await User.countDocuments({ role: 'admin' });
    
    if (existingAdminCount > 0) {
      console.log(`Found ${existingAdminCount} existing admin users. Skipping admin seeding.`);
      return [];
    }

    console.log('No existing admin users found. Creating admin accounts...');
    
    // Process each admin user
    const adminPromises = adminUsers.map(async (admin) => {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(admin.password, salt);
      
      // Create the admin user with hashed password
      return new User({
        ...admin,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }).save();
    });
    
    // Wait for all admins to be created
    const createdAdmins = await Promise.all(adminPromises);
    console.log(`Created ${createdAdmins.length} admin users successfully`);
    
    return createdAdmins;
  } catch (error) {
    console.error('Error seeding admin users:', error);
    throw error;
  }
};

// Run the seeder
const runSeeder = async () => {
  try {
    await connectDB();
    
    // First ensure roles exist (if using role-based access)
    await ensureRoles();
    
    // Then create admin users
    await seedAdmins();
    
    console.log('Admin seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error running admin seeder:', error);
    process.exit(1);
  }
};

// Execute the seeder if this file is run directly
if (require.main === module) {
  runSeeder();
}

// Export for use in other seeders
module.exports = {
  seedAdmins
};