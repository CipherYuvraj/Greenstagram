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

import { connectDB } from "@/config/database";
import { connectRedis } from "@/config/redis";
import { initializeAzureKeyVault } from "@/config/azure";
import { errorHandler } from "@/middleware/errorHandler";
import { notFound } from "@/middleware/notFound";
import { socketHandler } from "@/socket/socketHandler";
import logger from "@/utils/logger";

// Route imports
import authRoutes from "@/routes/auth";
import userRoutes from "@/routes/users";
import postRoutes from "@/routes/posts";
import challengeRoutes from "@/routes/challenges";
import searchRoutes from "@/routes/search";
import aiRoutes from "@/routes/ai";
import notificationRoutes from "@/routes/notifications";

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
    await connectRedis();
    await initializeAzureKeyVault();
    logger.info("All services initialized successfully");
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

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    services: {
      keyVault: process.env.AZURE_KEY_VAULT_URL ? "configured" : "not configured",
      database: "connected", // TODO: Add actual health check
      // TODO: Add other service health checks
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
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
});

export { io };
export default app;