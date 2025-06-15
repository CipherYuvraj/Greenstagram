import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { authService } from '../services/authService';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { 
    success: false, 
    message: 'Too many authentication attempts, please try again later' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 login requests per windowMs
  message: { 
    success: false, 
    message: 'Too many login attempts, please try again later' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Register validation middleware
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array')
];

// Login validation middleware
const loginValidation = [
  body('emailOrUsername')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Register endpoint
router.post('/register', authLimiter, registerValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, email, password, bio, interests } = req.body;

    const result = await authService.registerUser({
      username,
      email,
      password,
      bio,
      interests
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        token: result.token
      }
    });

  } catch (error) {
    logger.error('Registration failed:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});

// Login endpoint
router.post('/login', loginLimiter, loginValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { emailOrUsername, password } = req.body;

    const result = await authService.loginUser(emailOrUsername, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        token: result.token
      }
    });

  } catch (error) {
    logger.error('Login failed:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
});

// Profile endpoint (protected)
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    logger.error('Failed to get profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
});

// Logout endpoint (protected)
router.post('/logout', authenticate, async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // Here we can log the event for analytics
    logger.trackEvent('UserLoggedOut', { userId: req.user.userId });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout failed:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

export default router;
