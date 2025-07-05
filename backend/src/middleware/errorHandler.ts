import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  path?: string;
  value?: any;
  errors?: any;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction) => {
  // Log the error for debugging
  logger.error(`Error handling request: ${req.method} ${req.path}`, {
    error: err.message,
    stack: err.stack,
    code: err.code
  });

  // Check for specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: formatValidationErrors(err),
      code: 'VALIDATION_ERROR'
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }

  if ((err as any).code === 'ECONNREFUSED' && err.message?.includes('Redis')) {
    logger.warn('Redis connection error in request - continuing without caching');
    // Don't return an error to the client, let the request continue
    return _next();
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Server error' : err.message || 'Something went wrong';

  return res.status(statusCode).json({
    success: false,
    message,
    code: err.code || 'SERVER_ERROR'
  });
};

/**
 * Format mongoose validation errors into a readable format
 */
const formatValidationErrors = (err: any) => {
  const errors: Record<string, string> = {};

  if (err.errors) {
    Object.keys(err.errors).forEach(key => {
      errors[key] = err.errors[key].message;
    });
  }

  return errors;
};

export const notFound = (req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};
