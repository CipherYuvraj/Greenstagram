import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import {User} from '@/models/user';
import { getJWTSecret } from '@/config/azure';
import { validateRequest, registerSchema, loginSchema } from '@/middleware/validation';
import { authenticate } from '@/middleware/auth';
import { AuthRequest } from '@/types';
import logger from '@/utils/logger';

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register
router.post('/register', authLimiter, validateRequest(registerSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
      return;
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      ecoPoints: 50, // Welcome bonus
      lastActive: new Date()
    });

    await user.save();

    // Generate JWT token
    const jwtSecret = await getJWTSecret();
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });

    // Add welcome badge
    (user as any).addBadge({
      badgeId: 'welcome',
      name: 'Welcome to Greenstagram',
      description: 'Joined the eco-community',
      icon: '🌱',
      category: 'special'
    });

    await user.save();

    logger.info(`New user registered: ${username}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          ecoLevel: user.ecoLevel,
          ecoPoints: user.ecoPoints
        }
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login
router.post('/login', authLimiter, validateRequest(loginSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrUsername, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });
    
    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Update streak and last active
    (user as any).updateStreak();
    await user.save();

    // Generate JWT token
    const jwtSecret = await getJWTSecret();
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });

    logger.info(`User logged in: ${user.username}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          ecoLevel: user.ecoLevel,
          ecoPoints: user.ecoPoints,
          currentStreak: user.currentStreak,
          isPrivate: user.isPrivate
        }
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as unknown as AuthRequest;
    const user = await User.findById(authReq.user!._id)
      .select('-password')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});
// Refresh token
router.post('/refresh', authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as unknown as AuthRequest;
    const jwtSecret = await getJWTSecret();
    const token = jwt.sign({ userId: authReq.user!._id }, jwtSecret, { expiresIn: '7d' });

    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
