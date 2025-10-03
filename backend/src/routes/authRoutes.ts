import express, { Request, Response } from 'express';
import { authService } from '../services/authService';
import { authenticate } from '../middleware/authMiddleware';
import {User} from '../models/user'; // Add the User model import

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    // Add other user properties as needed
  };
}

const router = express.Router();

// Register a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, bio, interests } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    
    const userData = await authService.registerUser(username, email, password, bio, interests);
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userData
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { emailOrUsername, password } = req.body;
    
    // Validate input
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Email/username and password are required' });
    }
    
    const userData = await authService.loginUser(emailOrUsername, password);
    return res.json({
      success: true,
      message: 'Login successful',
      data: userData
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(401).json({
      success: false,
      message: errorMessage
    });
  }
});

// Profile endpoint (protected route example)
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
      return;
    }
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
      return;
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

export default router;