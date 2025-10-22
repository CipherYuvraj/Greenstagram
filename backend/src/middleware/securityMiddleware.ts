import hpp from 'hpp'
import csurf from 'csurf'
import cookieParser from 'cookie-parser'
import { Application } from 'express'
import logger from '../utils/logger'

export const applySecurity = (app: Application) => {
  // Always use cookie parser and hpp
  app.use(cookieParser())
  app.use(hpp())

  // Only apply CSRF in production
  if (process.env.NODE_ENV === 'production') {
    app.use(
      csurf({
        cookie: true,
      })
    )
    logger.info('CSRF protection is enabled')
  } else {
    // In development, log that CSRF is disabled
    app.use((req, res, next) => {
      // Skip CSRF for API routes in development
      if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) {
        return next()
      }
      // For non-API routes, we might want to still check CSRF
      return csurf({ cookie: true })(req, res, next)
    })
    logger.warn('CSRF protection is disabled in development mode')
  }
}
