import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle requests to routes that don't exist (404 Not Found)
 */
export const notFound = (req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`,
    code: 'NOT_FOUND'
  });
};

export default notFound;
