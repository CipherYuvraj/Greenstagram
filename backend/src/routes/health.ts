import express from 'express';
import { azureKeyVault } from '../config/azure';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const keyVaultHealth = await azureKeyVault.healthCheck();
    
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        keyVault: keyVaultHealth,
        database: {
          status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          name: mongoose.connection.name
        }
      }
    };

    const statusCode = keyVaultHealth.status === 'healthy' && 
                      mongoose.connection.readyState === 1 ? 200 : 503;

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
