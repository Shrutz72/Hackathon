// config/db.js
const mongoose = require('mongoose');
const config = require('./env');

// Logger for database events
const logDatabaseEvent = (event, details = '') => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [DATABASE] ${event} ${details}`);
};

// Configure mongoose
mongoose.set('strictQuery', false); // Mongoose 7 preparation

// Database connection function
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.db.uri, {
      ...config.db.options,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    logDatabaseEvent('Connected', `MongoDB connected: ${conn.connection.host}`);
    
    // Set up connection event handlers
    setupConnectionHandlers(conn);
    
    return conn;
  } catch (err) {
    logDatabaseEvent('Connection Error', err.message);
    // Exit process with failure in production, otherwise just log the error
    if (config.app.env === 'production') {
      process.exit(1);
    }
    throw err;
  }
};

// Set up event handlers for the mongoose connection
const setupConnectionHandlers = (conn) => {
  const connection = conn.connection;
  
  // Connection error events
  connection.on('error', (err) => {
    logDatabaseEvent('Error', err.message);
  });
  
  // When the connection is disconnected
  connection.on('disconnected', () => {
    logDatabaseEvent('Disconnected', 'MongoDB connection lost');
    
    // Attempt to reconnect if not in test environment
    if (config.app.env !== 'test') {
      logDatabaseEvent('Reconnecting', 'Attempting to reestablish connection...');
      setTimeout(connectDB, 5000); // Try to reconnect after 5 seconds
    }
  });
  
  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', () => {
    connection.close(() => {
      logDatabaseEvent('Terminated', 'MongoDB connection closed through app termination');
      process.exit(0);
    });
  });
  
  // When connection is reconnected
  connection.on('reconnected', () => {
    logDatabaseEvent('Reconnected', 'MongoDB reconnection successful');
  });
  
  // Log when connection is connected
  connection.on('connected', () => {
    logDatabaseEvent('Connected', 'MongoDB connection established');
  });
  
  // Log when connection is open
  connection.on('open', () => {
    logDatabaseEvent('Open', 'MongoDB connection is open');
  });
};

// Check the database connection health
const checkConnection = () => {
  const state = mongoose.connection.readyState;
  switch (state) {
    case 0:
      return { status: 'disconnected', connected: false };
    case 1:
      return { status: 'connected', connected: true };
    case 2:
      return { status: 'connecting', connected: false };
    case 3:
      return { status: 'disconnecting', connected: false };
    default:
      return { status: 'unknown', connected: false };
  }
};

// Get database statistics
const getDbStats = async () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected');
  }
  
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      dbName: mongoose.connection.db.databaseName,
      collections: stats.collections,
      objects: stats.objects,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
    };
  } catch (err) {
    logDatabaseEvent('Stats Error', err.message);
    throw err;
  }
};

// Close the database connection
const closeConnection = async () => {
  try {
    await mongoose.connection.close();
    logDatabaseEvent('Closed', 'Database connection closed');
    return true;
  } catch (err) {
    logDatabaseEvent('Close Error', err.message);
    throw err;
  }
};

module.exports = {
  connectDB,
  checkConnection,
  getDbStats,
  closeConnection,
  mongoose
};