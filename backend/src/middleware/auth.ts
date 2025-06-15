import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required - missing or invalid token format'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required - no token provided'
      });
      return;
    }

    const decoded = await authService.verifyToken(token);
    
    // Verify user still exists and is active
    const user = await authService.getUserById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Authentication failed - user not found or inactive'
      });
      return;
    }

    req.user = { userId: decoded.userId };
    next();

  } catch (error: any) {
    logger.error('Authentication middleware error:', error);
    
    let message = 'Authentication failed';
    if (error.message.includes('expired')) {
      message = 'Token has expired';
    } else if (error.message.includes('invalid')) {
      message = 'Invalid token';
    }

    res.status(401).json({
      success: false,
      message
    });
  }
};

// Optional authentication middleware - doesn't fail if no token provided
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    if (token) {
      try {
        const decoded = await authService.verifyToken(token);
        req.user = { userId: decoded.userId };
      } catch (error) {
        // Ignore token errors in optional auth
        logger.warn('Optional auth - invalid token provided');
      }
    }

    next();

  } catch (error: any) {
    logger.error('Optional authentication middleware error:', error);
    next(); // Continue even if there's an error
  }
};
