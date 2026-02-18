/**
 * Professional Database Configuration
 * Handles MongoDB connection with proper error handling and monitoring
 */

import mongoose from 'mongoose';
import { config } from './environment.js';

// Connection state tracking
let isConnected = false;

// Database connection options
const connectionOptions = {
  ...config.database.options,
  // Additional production-ready options
  bufferCommands: false,
  connectTimeoutMS: 10000,
  family: 4, // Use IPv4, skip trying IPv6
};

// Connection event handlers
const setupConnectionHandlers = () => {
  mongoose.connection.on('connected', () => {
    isConnected = true;
  });

  mongoose.connection.on('error', () => {
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    if (config.server.isProduction) {
      setTimeout(connectDatabase, 5000);
    }
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
  });

  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      process.exit(0);
    } catch (error) {
      process.exit(1);
    }
  });
};

// Connect to database
export const connectDatabase = async () => {
  try {
    // Set up connection handlers
    setupConnectionHandlers();

    // Connect to MongoDB
    await mongoose.connect(config.database.uri, connectionOptions);
    
    // Set mongoose options
    mongoose.set('strictQuery', true);
    
    // Mongoose debug - set MONGOOSE_DEBUG=true to log queries (off by default)
    mongoose.set('debug', process.env.MONGOOSE_DEBUG === 'true');

    return mongoose.connection;
  } catch (error) {
    console.error('[ScanBit] Database connection failed:', error?.message || error);
    // In development, exit the process
    if (config.server.isDevelopment) {
      process.exit(1);
    }
    
    // In production, you might want to implement retry logic
    if (config.server.isProduction) {
      setTimeout(connectDatabase, 10000);
    }
    
    throw error;
  }
};

// Get connection status
export const getConnectionStatus = () => {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    collections: Object.keys(mongoose.connection.collections)
  };
};

// Health check for database
export const healthCheck = async () => {
  try {
    if (!isConnected) {
      throw new Error('Database not connected');
    }

    // Ping the database
    await mongoose.connection.db.admin().ping();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      ...getConnectionStatus()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      ...getConnectionStatus()
    };
  }
};

// Close database connection
export const closeDatabase = async () => {
  try {
    await mongoose.connection.close();
    isConnected = false;
  } catch (error) {
    throw error;
  }
};

// Database statistics
export const getDatabaseStats = async () => {
  try {
    if (!isConnected) {
      throw new Error('Database not connected');
    }

    const stats = await mongoose.connection.db.stats();
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    return {
      database: stats.db,
      collections: collections.length,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      objects: stats.objects,
      avgObjSize: stats.avgObjSize,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw error;
  }
};

// Create database indexes for better performance - industry standard
export const createIndexes = async () => {
  const coll = (name) => mongoose.connection.collection(name);
  const safeIndex = async (collection, keys, opts = {}) => {
    try {
      await coll(collection).createIndex(keys, opts);
    } catch (_e) { /* index may exist */ }
  };

  try {
    // User indexes
    await safeIndex('users', { email: 1 }, { unique: true });
    await safeIndex('users', { role: 1 });
    await safeIndex('users', { isActive: 1 });
    await safeIndex('users', { createdAt: -1 });
    await safeIndex('users', { restaurant: 1 });
    await safeIndex('users', { lastLogin: -1 });

    // Restaurant indexes
    await safeIndex('restaurants', { owner: 1 });
    await safeIndex('restaurants', { email: 1 });
    await safeIndex('restaurants', { businessCategory: 1 });
    await safeIndex('restaurants', { businessType: 1 });
    await safeIndex('restaurants', { verificationStatus: 1 });
    await safeIndex('restaurants', { 'subscription.status': 1 });
    await safeIndex('restaurants', { isArchived: 1 });
    await safeIndex('restaurants', { createdAt: -1 });
    // customSlug index defined in Restaurant model (unique + sparse)
    await safeIndex('restaurants', { businessCategory: 1, 'subscription.status': 1 });

    // Category indexes
    await safeIndex('categories', { restaurant: 1 });
    await safeIndex('categories', { name: 1, restaurant: 1 });

    // Menu item indexes
    await safeIndex('menuitems', { restaurant: 1 });
    await safeIndex('menuitems', { category: 1 });
    await safeIndex('menuitems', { available: 1 });
    await safeIndex('menuitems', { restaurant: 1, available: 1 });
    await safeIndex('menuitems', { restaurant: 1, category: 1 });

    // QR scan indexes
    await safeIndex('qrscans', { restaurant: 1 });
    await safeIndex('qrscans', { scannedAt: -1 });
    await safeIndex('qrscans', { restaurant: 1, scannedAt: -1 });

    // Payment indexes
    await safeIndex('payments', { user: 1 });
    await safeIndex('payments', { restaurant: 1 });
    await safeIndex('payments', { status: 1 });
    await safeIndex('payments', { createdAt: -1 });
    await safeIndex('payments', { razorpayOrderId: 1 });

    // Advertisement indexes
    await safeIndex('advertisements', { status: 1 });
    await safeIndex('advertisements', { businessCategory: 1 });
    await safeIndex('advertisements', { startDate: 1, endDate: 1 });
    await safeIndex('adimpressions', { advertisement: 1 });
    await safeIndex('adimpressions', { createdAt: -1 });

    // Blog indexes (slug unique index from schema)
    await safeIndex('blogs', { isPublished: 1, createdAt: -1 });
    await safeIndex('blogs', { category: 1 });

    // Review indexes
    await safeIndex('reviews', { restaurant: 1 });
    await safeIndex('reviews', { createdAt: -1 });
    await safeIndex('reviews', { restaurant: 1, createdAt: -1 });

    // Support ticket indexes
    await safeIndex('supporttickets', { user: 1 });
    await safeIndex('supporttickets', { status: 1 });
    await safeIndex('supporttickets', { createdAt: -1 });

    // Brochure download indexes
    await safeIndex('brochuredownloads', { email: 1, createdAt: -1 });
    await safeIndex('brochuredownloads', { createdAt: -1 });

    // OTP indexes (expiresAt TTL index from OtpCode model)
    await safeIndex('otpcodes', { email: 1, type: 1 });

    // FAQ, KnowledgeBase, LegalDocument
    await safeIndex('faqs', { category: 1 });
    await safeIndex('knowledgebases', { category: 1 });
    await safeIndex('legaldocuments', { type: 1, language: 1 });
    // legaldocuments slug: unique index from schema

    // Business category & info
    await safeIndex('businesscategories', { slug: 1 }, { sparse: true });
    await safeIndex('businessinformations', { restaurant: 1 });

    // Bulk email log
    await safeIndex('bulkemaillogs', { createdAt: -1 });
  } catch (_error) { /* non-fatal */ }
};

export default {
  connectDatabase,
  getConnectionStatus,
  healthCheck,
  closeDatabase,
  getDatabaseStats,
  createIndexes
};