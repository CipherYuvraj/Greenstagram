import { Request, Response, NextFunction, RequestHandler } from 'express';
import {authService} from '../services/authService';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

export const authenticate: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const decoded = await authService.verifyToken(token);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
