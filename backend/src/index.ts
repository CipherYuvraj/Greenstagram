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

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "https:", "data:"],
      },
    }
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
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

// Initialize connections
const initializeApp = async () => {
  try {
    await connectDB();
    logger.info("MongoDB connected successfully");
    
    // Try to connect to Redis, but don't fail if it's not available
    try {
      await connectRedis();
    } catch (error) {
      logger.warn("Redis connection failed, continuing without caching");
    }
    
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
app.get("/healthz", (_req, res) => {
  const appInsights = require('./config/applicationInsights');
  
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    services: {
      database: "connected",
//      redis: redisClient?.isRedisAvailable() ? "connected" : "not connected",
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
const PORT = process.env.PORT || 5000;

initializeApp().then(() => {
  httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`📍 API URL: http://localhost:${PORT}`);
    logger.info(
      `🔐 Key Vault: ${
        azureKeyVault.isConnected() ? "✅ Connected" : "❌ Not Connected"
      }`
    );
    // Add App Insights status logging
    const appInsights = require('./config/applicationInsights');
    logger.info(
      `📊 Application Insights: ${
        appInsights.isConnected() ? "✅ Connected" : "❌ Not Connected"
      }`
    );
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
});

export { io };
export default app;