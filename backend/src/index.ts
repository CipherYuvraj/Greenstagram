import connectDB from "./db";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {User} from "./models";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
connectDB();
app.get('/', (_req, res) => {
  res.json({ message: 'Greenstagram API is running!' });
});

// Health check route
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
});
app.post('/test/user', async (_req, res) => {
  try {
    const testUser = new User({
      username: 'testuser_',
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
  } catch (error:any) {
    res.status(400).json({ 
      success: false, 
      message: 'Error creating user',
      error: error.message 
    });
  }
});

export default app;