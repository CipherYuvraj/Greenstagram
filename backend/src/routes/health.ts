import express from 'express';
import { azureKeyVault } from '../config/azure';
import mongoose from 'mongoose';
import redis from '../config/redis';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const keyVaultHealth = await azureKeyVault.healthCheck();
    const redisHealth = await redis.checkHealth();
    const redisStatus = redis.getStatus();

    // Determine overall Redis health status
    const redisHealthStatus = !redisStatus.configured
      ? 'not_configured'
      : redisHealth.connected && redisHealth.responsive
      ? 'healthy'
      : redisHealth.connected
      ? 'degraded'
      : 'disconnected';

    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      services: {
        keyVault: keyVaultHealth,
        database: {
          status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          name: mongoose.connection.name,
          host: mongoose.connection.host
        },
        redis: {
          status: redisHealthStatus,
          configured: redisStatus.configured,
          connected: redisHealth.connected,
          responsive: redisHealth.responsive,
          latency: redisHealth.latency || null,
          connectionAttempts: redisStatus.connectionAttempts,
          error: redisHealth.error || null,
          message: !redisStatus.configured
            ? 'Redis not configured. Set REDIS_URL to enable caching.'
            : redisHealth.connected && redisHealth.responsive
            ? 'Redis is healthy and responsive'
            : redisHealth.connected
            ? 'Redis connected but not responding to pings'
            : 'Redis configured but not connected. Application running without caching.'
        }
      }
    };

    // Decide HTTP status code
    // Redis is optional, so we don't fail health check if it's not available
    const statusCode =
      keyVaultHealth.status === 'healthy' &&
      mongoose.connection.readyState === 1
        ? 200
        : 503;

    res.status(statusCode).json({
      success: true,
      data: health
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

export default router;
