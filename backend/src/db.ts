import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        await mongoose.connect(mongoUri, {
            // SSL/TLS options to handle connection issues
            ssl: true,
            // Increase timeout values
            serverSelectionTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000, // 45 seconds
            // Buffer settings
            bufferCommands: false,
            // Connection pool settings
            maxPoolSize: 10,
            minPoolSize: 5,
        });

        console.log("✅ MongoDB connected successfully");
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error("❌ MongoDB connection error:", err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log("⚠️ MongoDB disconnected");
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log("🔄 MongoDB reconnected");
        });
        
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        // Don't exit immediately, allow for retries
        setTimeout(() => {
            console.log("🔄 Retrying MongoDB connection...");
            connectDB();
        }, 5000);
    }
};

export default connectDB;