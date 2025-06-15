import mongoose from 'mongoose';
import { logger } from '../loggerutils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const connectionString = process.env.MONGODB_CONNECTION_STRING;
    
    if (!connectionString) {
      throw new Error('MongoDB connection string is not defined');
    }

    const conn = await mongoose.connect(connectionString, {
      maxPoolSize: 10, // Connection pooling best practice
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Set up database indexes for performance
    await setupIndexes();
    
  } catch (error) {
    logger.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

const setupIndexes = async (): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    
    // User indexes for performance
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ 'followers': 1 });
    await db.collection('users').createIndex({ 'following': 1 });
    
    // Post indexes for feed and search
    await db.collection('posts').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('posts').createIndex({ hashtags: 1 });
    await db.collection('posts').createIndex({ createdAt: -1 });
    await db.collection('posts').createIndex({ 'location.coordinates': '2dsphere' });
    
    // Challenge indexes
    await db.collection('challenges').createIndex({ startDate: 1, endDate: 1 });
    await db.collection('challenges').createIndex({ difficulty: 1 });
    await db.collection('challenges').createIndex({ category: 1 });
    
    // Comment indexes
    await db.collection('comments').createIndex({ postId: 1, createdAt: -1 });
    
    logger.info('✅ Database indexes created successfully');
  } catch (error) {
    logger.error('❌ Error creating database indexes:', error);
  }
};

// Handle connection events
mongoose.connection.on('error', (error) => {
  logger.error('❌ MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('✅ MongoDB reconnected');
});
