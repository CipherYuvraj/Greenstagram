import { createClient } from 'redis';
import logger from '../utils/logger';

// Redis client instance
let redisClient: any = null;
let redisEnabled = false;

/**
 * Connect to Redis server
 */
export const connectRedis = async () => {
  try {
    if (!process.env.REDIS_URL) {
      logger.warn('Redis URL not found in environment variables. Redis caching will be disabled.');
      return;
    }

    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          // Limit reconnection attempts to avoid infinite retries
          if (retries > 5) {
            logger.warn('Max Redis reconnection attempts reached. Redis caching will be disabled.');
            return false; // Stop retrying
          }
          return Math.min(retries * 100, 3000); // Time between retries with exponential backoff
        }
      }
    });

    // Handle connection events
    redisClient.on('error', (err: any) => {
      logger.error('Redis Client Error:', err);
      redisEnabled = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
      redisEnabled = true;
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis Client Reconnecting...');
    });

    redisClient.on('end', () => {
      logger.info('Redis Client Connection Closed');
      redisEnabled = false;
    });

    await redisClient.connect();
    redisEnabled = true;
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.error('Redis connection error:', error);
    logger.warn('Application will continue without Redis caching');
    redisEnabled = false;
  }
};

/**
 * Get value from Redis cache
 * @param key Cache key
 * @returns The cached value or null if not found
 */
export const cacheGet = async (key: string) => {
  if (!redisEnabled || !redisClient) {
    return null;
  }
  
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Error getting data from Redis cache:', error);
    return null;
  }
};

/**
 * Set value in Redis cache
 * @param key Cache key
 * @param value Value to cache
 * @param ttl Time to live in seconds
 * @returns true if successful, false otherwise
 */
export const cacheSet = async (key: string, value: any, ttl: number = 3600) => {
  if (!redisEnabled || !redisClient) {
    return false;
  }
  
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttl });
    return true;
  } catch (error) {
    logger.error('Error setting data in Redis cache:', error);
    return false;
  }
};

/**
 * Delete value from Redis cache
 * @param key Cache key
 * @returns true if successful, false otherwise
 */
export const cacheDelete = async (key: string) => {
  if (!redisEnabled || !redisClient) {
    return false;
  }
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Error deleting data from Redis cache:', error);
    return false;
  }
};

/**
 * Clear Redis cache
 * @returns true if successful, false otherwise
 */
export const cacheClear = async () => {
  if (!redisEnabled || !redisClient) {
    return false;
  }
  
  try {
    await redisClient.flushDb();
    return true;
  } catch (error) {
    logger.error('Error clearing Redis cache:', error);
    return false;
  }
};

/**
 * Check if Redis is connected and available
 * @returns true if Redis is available, false otherwise
 */
export const isRedisAvailable = () => {
  return redisEnabled && redisClient?.isReady;
};

export default {
  client: redisClient,
  isRedisAvailable,
  get: cacheGet,
  set: cacheSet,
  delete: cacheDelete,
  clear: cacheClear
};
