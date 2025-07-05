import mongoose from 'mongoose';
import logger from '@/utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Create text indexes for search functionality
    await createIndexes();

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async (): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    
    // Text indexes for search
    await db.collection('posts').createIndex({
      content: 'text',
      hashtags: 'text',
      'location.name': 'text'
    });

    await db.collection('users').createIndex({
      username: 'text',
      bio: 'text'
    });

    await db.collection('challenges').createIndex({
      title: 'text',
      description: 'text',
      category: 'text'
    });

    // Performance indexes
    await db.collection('posts').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('posts').createIndex({ hashtags: 1 });
    await db.collection('posts').createIndex({ 'location.coordinates': '2dsphere' });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('challenges').createIndex({ status: 1, startDate: -1 });

    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.warn('Index creation warning:', error);
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed through app termination');
  process.exit(0);
});
