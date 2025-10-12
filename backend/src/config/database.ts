import mongoose from 'mongoose';
import logger from '../utils/logger';

// Direct MongoDB connection with comprehensive error handling
export const connectDB = async (): Promise<void> => {
  // Use MONGODB_URI from environment variables if available, otherwise fall back to localhost
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/greenstagram';
  
  // Try different connection strings and options
  const connectionAttempts = [
    {
      name: 'Environment MONGODB_URI with options',
      uri: mongoUri,
      options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 30000,
        family: 4, // Force IPv4
        autoIndex: true,
        retryWrites: true,
        w: 'majority' as const
      }
    },
    {
      name: 'Direct IPv4 with options',
      uri: 'mongodb://127.0.0.1:27017/greenstagram?retryWrites=true&w=majority',
      options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 30000,
        family: 4, // Force IPv4
        autoIndex: true,
        retryWrites: true,
        w: 'majority' as const
      }
    },
    {
      name: 'Simplest connection',
      uri: 'mongodb://127.0.0.1:27017/greenstagram',
      options: {}
    }
  ];

  let lastError: Error | null = null;

  for (const attempt of connectionAttempts) {
    try {
      logger.info(`\n🔄 Attempting connection: ${attempt.name}`);
      logger.info(`🔌 Using URI: ${attempt.uri}`);
      logger.info('⚙️  With options:', attempt.options);

      const conn = await mongoose.connect(attempt.uri, attempt.options);
      
      // Connection successful
      logger.info(`\n✅ MongoDB Connected Successfully!`);
      logger.info(`   Host: ${conn.connection.host}`);
      logger.info(`   Database: ${conn.connection.name}`);
      logger.info(`   Port: ${conn.connection.port}`);
      logger.info(`   Ready State: ${['disconnected', 'connected', 'connecting', 'disconnecting'][conn.connection.readyState]}`);
      
      // Set up event handlers
      setupMongoEventHandlers();
      
      // Create indexes
      await createIndexes();
      
      return; // Success, exit the function
      
    } catch (error: any) {
      lastError = error;
      logger.error(`❌ Connection attempt failed (${attempt.name}): ${error.message}`);
      
      // Close any existing connection before retrying
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }
      
      // Add a small delay before next attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // If we get here, all connection attempts failed
  logger.error('\n❌ All MongoDB connection attempts failed. Last error:', {
    message: lastError?.message,
    name: lastError?.name,
    code: (lastError as any)?.code,
    stack: lastError?.stack,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NODE_VERSION: process.version,
      OS: process.platform,
      ARCH: process.arch
    }
  });
  
  // Add a delay before exiting to ensure logs are written
  await new Promise(resolve => setTimeout(resolve, 2000));
  process.exit(1);
};

// Set up MongoDB event handlers
function setupMongoEventHandlers() {
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

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
}

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
