const mongoose = require('mongoose');
const Neighbourhood = require('../models/Neighbourhood'); // Assuming you have a Neighbourhood model

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

// Define sample neighbourhoods with GeoJSON boundaries
// Note: These are simplified examples. In a real application, you would use actual
// GeoJSON polygons that accurately represent neighbourhood boundaries
const neighbourhoods = [
  {
    name: 'Downtown',
    description: 'The central business and commercial district of the city.',
    city: 'Metropolis',
    state: 'State',
    country: 'Country',
    postalCodes: ['10001', '10002'],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [-73.9876, 40.7661],
        [-73.9776, 40.7661],
        [-73.9776, 40.7561],
        [-73.9876, 40.7561],
        [-73.9876, 40.7661]
      ]]
    },
    center: {
      type: 'Point',
      coordinates: [-73.9826, 40.7611]
    },
    population: 25000,
    tags: ['urban', 'commercial', 'high-density']
  },
  {
    name: 'Riverside',
    description: 'Scenic neighbourhood along the river with parks and recreational areas.',
    city: 'Metropolis',
    state: 'State',
    country: 'Country',
    postalCodes: ['10003', '10004'],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [-73.9976, 40.7761],
        [-73.9876, 40.7761],
        [-73.9876, 40.7661],
        [-73.9976, 40.7661],
        [-73.9976, 40.7761]
      ]]
    },
    center: {
      type: 'Point',
      coordinates: [-73.9926, 40.7711]
    },
    population: 18000,
    tags: ['waterfront', 'parks', 'residential']
  },
  {
    name: 'Westside',
    description: 'Primarily residential area with schools and community centers.',
    city: 'Metropolis',
    state: 'State',
    country: 'Country',
    postalCodes: ['10005', '10006'],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [-74.0076, 40.7561],
        [-73.9976, 40.7561],
        [-73.9976, 40.7461],
        [-74.0076, 40.7461],
        [-74.0076, 40.7561]
      ]]
    },
    center: {
      type: 'Point',
      coordinates: [-74.0026, 40.7511]
    },
    population: 32000,
    tags: ['residential', 'schools', 'family-friendly']
  },
  {
    name: 'Industrial District',
    description: 'Manufacturing and industrial zone with warehouses and factories.',
    city: 'Metropolis',
    state: 'State',
    country: 'Country',
    postalCodes: ['10007'],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [-73.9776, 40.7361],
        [-73.9676, 40.7361],
        [-73.9676, 40.7261],
        [-73.9776, 40.7261],
        [-73.9776, 40.7361]
      ]]
    },
    center: {
      type: 'Point',
      coordinates: [-73.9726, 40.7311]
    },
    population: 5000,
    tags: ['industrial', 'manufacturing', 'commercial']
  },
  {
    name: 'University Heights',
    description: 'Academic area surrounding the university campus with student housing.',
    city: 'Metropolis',
    state: 'State',
    country: 'Country',
    postalCodes: ['10008', '10009'],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [-73.9576, 40.7561],
        [-73.9476, 40.7561],
        [-73.9476, 40.7461],
        [-73.9576, 40.7461],
        [-73.9576, 40.7561]
      ]]
    },
    center: {
      type: 'Point',
      coordinates: [-73.9526, 40.7511]
    },
    population: 15000,
    tags: ['academic', 'student', 'cultural']
  }
];

// Seed the database with neighbourhoods
const seedNeighbourhoods = async () => {
  try {
    // First, clear existing neighbourhoods
    await Neighbourhood.deleteMany({});
    console.log('Cleared existing neighbourhoods');

    // Insert new neighbourhoods
    const createdNeighbourhoods = await Neighbourhood.insertMany(neighbourhoods);
    console.log(`Seeded ${createdNeighbourhoods.length} neighbourhoods successfully`);

    return createdNeighbourhoods;
  } catch (error) {
    console.error('Error seeding neighbourhoods:', error);
    throw error;
  }
};

// Run the seeder
const runSeeder = async () => {
  try {
    await connectDB();
    await seedNeighbourhoods();
    console.log('Neighbourhood seeding completed successfully.');
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
  seedNeighbourhoods,
  neighbourhoods
};