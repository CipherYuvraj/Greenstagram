// Load environment first
import { loadEnvironment } from './config/env'; // Should be './config/env.js' in compiled JS
loadEnvironment();

// Now import other modules
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import "express-async-errors";

import { connectDB } from "./config/database";
import { connectRedis } from "./config/redis";
import { initializeAzureKeyVault, azureKeyVault } from "./config/azure";
import { initializeAppInsights } from "./config/applicationInsights";
import { errorHandler } from "./middleware/errorHandler";
import notFound from "./middleware/notFound";
import { socketHandler } from "./socket/socketHandler";
import logger from "./utils/logger";

// Route imports
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import postRoutes from "./routes/posts";
import challengeRoutes from "./routes/challenges";
import searchRoutes from "./routes/search";
import aiRoutes from "./routes/ai";
import notificationRoutes from "./routes/notifications";
import healthRoutes from "./routes/health";

// import Security Middleware
import { applySecurity } from './middleware/securityMiddleware';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean) as string[];

    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Access-Token',
    'X-Key',
    'Cache-Control',
    'Pragma',
    'Expires',
    'If-Modified-Since',
    'If-None-Match',
    'User-Agent',
    'Accept-Language',
    'Accept-Encoding'
  ],
  exposedHeaders: [
    'Authorization',
    'X-Total-Count',
    'X-Page-Count',
    'Content-Range'
  ],
  credentials: true, // Changed from false to true to allow credentials
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Add a simple test endpoint
export const testCors = (app: express.Application) => {
  app.get('/api/test-cors', (req, res) => {
    res.json({ message: 'CORS is working!', timestamp: new Date().toISOString() });
  });
};

testCors(app);

// Security middleware with CORS-friendly settings
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // Disable for API server
}));

// Manual OPTIONS handler for preflight requests
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires, If-Modified-Since, If-None-Match, User-Agent, Accept-Language, Accept-Encoding');
  res.header('Access-Control-Max-Age', '86400');
  
  console.log('✅ OPTIONS request handled for:', req.path);
  res.sendStatus(200);
});

// Log all incoming requests
app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.originalUrl}`, {
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params
  });
  next();
});
app.use(compression());
app.use(
  morgan("combined", {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// securityMiddleware
applySecurity(app);

// Initialize connections
const initializeApp = async () => {
  try {
    await connectDB();
    logger.info("MongoDB connected successfully");
    
    // Connect to Redis - errors are handled internally with graceful fallback
    await connectRedis();
    
    // Initialize Application Insights if configured
    try {
      if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
        const appInsightsInitialized = initializeAppInsights();
        if (appInsightsInitialized) {
          logger.info("Application Insights initialized successfully");
        } else {
          logger.warn("Application Insights initialization failed, continuing without telemetry");
        }
      } else {
        logger.info("Application Insights connection string not configured, skipping initialization");
      }
    } catch (error) {
      logger.warn("Application Insights initialization error:", error);
    }
    
    // Initialize Azure Key Vault if configured
    try {
      if (process.env.AZURE_KEY_VAULT_URL) {
        await initializeAzureKeyVault();
        logger.info("Azure Key Vault initialized successfully");
      } else {
        logger.info("Azure Key Vault URL not configured, skipping initialization");
      }
    } catch (error) {
      logger.warn("Azure Key Vault initialization failed, using fallback secrets");
    }
    
    logger.info("Application initialization completed");
  } catch (error) {
    logger.error("Failed to initialize services:", error);
    process.exit(1);
  }
};

// Socket.io setup
socketHandler(io);

// Import Redis functions
import { getRedisStatus } from './config/redis';

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/health", healthRoutes);

// Simple health check directly in index.ts (in case /routes/health isn't used)
app.get("/healthz", async (_req, res) => {
  const appInsights = require('./config/applicationInsights');
  const redisStatus = await getRedisStatus();
  
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    services: {
      database: "connected",
      redis: redisStatus.configured ? 
        (redisStatus.connected ? "connected" : "configured but not connected") : 
        "not configured",
      keyVault: process.env.AZURE_KEY_VAULT_URL ? 
        (azureKeyVault.isConnected() ? "connected" : "not connected") : 
        "not configured",
      appInsights: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ? 
        (appInsights.isConnected() ? "connected" : "not connected") : 
        "not configured"
    },
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;

// Error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
const startServer = async () => {
  try {
    await initializeApp();
    
    httpServer.listen(Number(PORT), '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌐 API URL: http://localhost:${PORT}`);
      logger.info(
        `🔐 Key Vault: ${azureKeyVault.isConnected() ? '✅ Connected' : '❌ Not Connected'}`
      );
      
      // Add App Insights status logging
      const appInsights = require('./config/applicationInsights');
      logger.info(
        `📊 Application Insights: ${appInsights.isConnected() ? '✅ Connected' : '❌ Not Connected'}`
      );
      
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info('🔄 Server is ready to accept connections');
    });

    // Handle server errors
    httpServer.on('error', (error) => {
      if ((error as any).code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { io };
export default app;