import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./db";
import { User } from "./models/Index";
import authRoutes from './routes/authRoutes';

// Load environment variables first
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);

// Basic routes
app.get('/', (_req, res) => {
  res.json({ message: 'Greenstagram API is running!' });
});

// Health check route
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test user creation route
app.post('/test/user', async (_req, res) => {
  try {
    const testUser = new User({
      username: 'yuvraj',
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
      bio: 'Test user for schema validation',
      interests: ['recycling', 'gardening']
    });
    
    const savedUser = await testUser.save();
    res.json({ 
      success: true, 
      message: 'User created successfully',
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        ecoLevel: savedUser.ecoLevel,
        ecoPoints: savedUser.ecoPoints
      }
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: 'Error creating user',
      error: error.message 
    });
  }
});

// Start server function
const startServer = async () => {
  try {
    // Connect to database (which will handle Key Vault integration)
    await connectDB();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}`);
      console.log(`🔐 Key Vault: ${process.env.KEYVAULT_URI ? 'Configured' : 'Not configured'}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;