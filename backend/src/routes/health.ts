import express from 'express';
import { azureKeyVault } from '../config/azure';
import mongoose from 'mongoose';
import redis from '../config/redis';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const keyVaultHealth = await azureKeyVault.healthCheck();
    const redisHealth = await redis.checkHealth();

    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        keyVault: keyVaultHealth,
        database: {
          status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          name: mongoose.connection.name
        },
        redis: {
          connected: redisHealth.connected,
          responsive: redisHealth.responsive,
          latency: redisHealth.latency || null,
          error: redisHealth.error || null
        }
      }
    };

    // Decide HTTP status code
    const statusCode =
      keyVaultHealth.status === 'healthy' &&
      mongoose.connection.readyState === 1 &&
      redisHealth.connected &&
      redisHealth.responsive
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
