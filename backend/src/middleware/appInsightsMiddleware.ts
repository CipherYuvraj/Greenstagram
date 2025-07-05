import { Request, Response, NextFunction } from 'express';
import { trackEvent, trackException } from '../config/applicationInsights';

/**
 * Middleware to track requests with Application Insights
 */
export const trackRequest = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Add a listener for when the response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const success = res.statusCode < 400;
    
    // Track the request
    trackEvent('HttpRequest', {
      method: req.method,
      url: req.originalUrl,
      duration: duration.toString(),
      statusCode: res.statusCode.toString(),
      success: success.toString(),
      userAgent: req.headers['user-agent'] || 'unknown'
    });
  });
  
  next();
};

/**
 * Error tracking middleware for Application Insights
 */
export const trackError = (err: Error, _req: Request, _res: Response, next: NextFunction) => {
  trackException(err);
  next(err);
};

export default { trackRequest, trackError };
