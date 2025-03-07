// config/env.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Define environment
const NODE_ENV = process.env.NODE_ENV || 'development';

// Define base configuration
const config = {
  // App configuration
  app: {
    name: process.env.APP_NAME || 'Community Issue Reporter',
    port: parseInt(process.env.PORT, 10) || 5000,
    env: NODE_ENV,
    baseUrl: process.env.BASE_URL || 'http://localhost:5000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    apiVersion: process.env.API_VERSION || 'v1',
  },
  
  // Database configuration
  db: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/community-issues',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-should-be-in-env',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'refresh-token-secret-should-be-in-env',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  // Email configuration (for notifications)
  email: {
    from: process.env.EMAIL_FROM || 'noreply@communityissues.com',
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    secure: process.env.EMAIL_SECURE === 'true',
  },
  
  // File upload configuration
  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf',
  },
  
  // Geo API configuration (for mapping)
  geo: {
    apiKey: process.env.GEO_API_KEY,
    provider: process.env.GEO_PROVIDER || 'google',
  },
  
  // Push notifications
  push: {
    apiKey: process.env.PUSH_API_KEY,
    enabled: process.env.PUSH_ENABLED === 'true',
  },
  
  // Social login configuration
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
    },
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // limit each IP to 100 requests per windowMs
  },
  
  // Feature flags
  features: {
    enableGamification: process.env.ENABLE_GAMIFICATION === 'true' || true,
    enableSocialSharing: process.env.ENABLE_SOCIAL_SHARING === 'true' || true,
    enableRealTimeUpdates: process.env.ENABLE_REAL_TIME_UPDATES === 'true' || true,
    enableComments: process.env.ENABLE_COMMENTS === 'true' || true,
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true' || true,
  },
  
  // Cache configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 60 * 60, // 1 hour in seconds
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD, 10) || 60, // 1 minute in seconds
  },
};

// Environment specific overrides
const environmentConfig = {
  development: {
    app: {
      frontendUrl: 'http://localhost:3000',
    },
    // Add any development-specific overrides
  },
  
  test: {
    app: {
      port: 5001,
    },
    db: {
      uri: process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/community-issues-test',
    },
    // Add any test-specific overrides
  },
  
  production: {
    app: {
      port: parseInt(process.env.PORT, 10) || 8080,
    },
    // Add any production-specific overrides
  },
};

// Merge the base config with environment specific config
const mergedConfig = {
  ...config,
  ...environmentConfig[NODE_ENV],
  // Deep merge app section
  app: {
    ...config.app,
    ...(environmentConfig[NODE_ENV] && environmentConfig[NODE_ENV].app ? environmentConfig[NODE_ENV].app : {}),
  },
  // Deep merge db section
  db: {
    ...config.db,
    ...(environmentConfig[NODE_ENV] && environmentConfig[NODE_ENV].db ? environmentConfig[NODE_ENV].db : {}),
  },
};

module.exports = mergedConfig;