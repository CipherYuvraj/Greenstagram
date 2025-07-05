import { createClient, RedisClientType } from 'redis';
import logger from '@/utils/logger';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err:any) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    await redisClient.connect();
  } catch (error) {
    logger.error('Redis connection error:', error);
    // Don't exit process, Redis is optional
  }
};

export const getRedisClient = (): RedisClientType => {
  return redisClient;
};

export const cacheSet = async (key: string, value: any, expiration: number = 3600): Promise<void> => {
  try {
    if (redisClient?.isReady) {
      await redisClient.setEx(key, expiration, JSON.stringify(value));
    }
  } catch (error) {
    logger.warn('Redis cache set error:', error);
  }
};

export const cacheGet = async (key: string): Promise<any> => {
  try {
    if (redisClient?.isReady) {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    }
    return null;
  } catch (error) {
    logger.warn('Redis cache get error:', error);
    return null;
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  try {
    if (redisClient?.isReady) {
      await redisClient.del(key);
    }
  } catch (error) {
    logger.warn('Redis cache delete error:', error);
  }
};
