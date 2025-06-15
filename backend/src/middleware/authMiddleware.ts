import { Request, RequestHandler } from 'express';
import {authService} from '../services/authService';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

export const authenticate: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = await authService.verifyToken(token);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
