import mongoose from 'mongoose';

let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_CONNECTION_STRING;
    
    if (!mongoUri) {
      throw new Error('MongoDB connection string not found');
    }

    await mongoose.connect(mongoUri, {
      bufferCommands: false,
    });

    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};
