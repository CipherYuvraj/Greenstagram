import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/database";
import { logger } from "./utils/logger";
import { azureKeyVault } from './config/azure';

// Routes
import authRoutes from './routes/auth';
import aiRoutes from './routes/ai';
import healthRoutes from './routes/health';
// TODO: Import additional routes as they are implemented
// import postRoutes from './routes/posts';
// import userRoutes from './routes/users';
// import challengeRoutes from './routes/challenges';

// Load environment variables first
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "https:", "data:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://greenstagram-frontend.azurestaticapps.net',
        'https://your-custom-domain.com' // TODO: Replace with actual domain
      ]
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { 
    success: false, 
    message: 'Too many requests from this IP, please try again later' 
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      keyVault: process.env.AZURE_KEY_VAULT_URL ? 'configured' : 'not configured',
      database: 'connected', // TODO: Add actual health check
      // TODO: Add other service health checks
    }
  });
});

// API routes
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
// TODO: Add other route handlers
// app.use('/api/posts', postRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/challenges', challengeRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({ 
    success: true,
    message: 'Greenstagram API is running!',
    version: '1.0.0',
    documentation: '/api/docs' // TODO: Add API documentation
  });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Start server function
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Test Azure Key Vault connection
    const keyVaultHealth = await azureKeyVault.healthCheck();
    logger.info(`🔐 Key Vault Status: ${keyVaultHealth.status}`);
    if (keyVaultHealth.error) {
      logger.warn(`🔐 Key Vault Error: ${keyVaultHealth.error}`);
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}`);
      console.log(`🔐 Key Vault: ${azureKeyVault.isConnected() ? '✅ Connected' : '❌ Not Connected'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

export default app;