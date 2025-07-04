import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import { getJWTSecret } from '@/config/azure';
import { AuthRequest } from '@/types';
import logger from '@/utils/logger';

export const authenticate = async (req:any , res: any, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const jwtSecret = await getJWTSecret();
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    // Update last active and streak
    // Direct update instead of using updateStreak method
    const now = new Date();
    user.lastActive = now;
    
    // Check if it's a new day since last login
    const lastActive = user.lastActive || new Date(0);
    const isNewDay = 
      now.getDate() !== lastActive.getDate() || 
      now.getMonth() !== lastActive.getMonth() || 
      now.getFullYear() !== lastActive.getFullYear();
      
    if (isNewDay) {
      // If last active was yesterday, increment streak
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActive.toDateString() === yesterday.toDateString()) {
        user.streaks.current= (user.streaks.current || 0) + 1;
      } else {
        // Reset streak if more than a day has passed
        user.streaks.current = 1;
      }
    }
    
    await user.save();

    req.user = user.toObject();
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const jwtSecret = await getJWTSecret();
      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user) {
        req.user = user.toObject();
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};

export const requireAdmin = (req: any, res: any, next: NextFunction) => {
  if (!req.user || !req.user.isVerified) {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required.' 
    });
  }
  next();
};
