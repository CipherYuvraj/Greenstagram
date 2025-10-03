import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';

// Redis client instance
let redisClient: RedisClientType | null = null;
let redisEnabled = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 5;

/**
 * Validates Redis URL format
 * @param url Redis connection URL
 * @returns Validation result with parsed details
 */
export const validateRedisUrl = (url: string): { 
  valid: boolean; 
  error?: string; 
  details?: {
    protocol: string;
    hostname: string;
    port: string;
    hasAuth: boolean;
  } 
} => {
  try {
    const parsed = new URL(url);
    
    // Check protocol
    if (!['redis:', 'rediss:'].includes(parsed.protocol)) {
      return {
        valid: false,
        error: `Invalid protocol '${parsed.protocol}'. Expected 'redis:' or 'rediss:' (for TLS)`,
      };
    }

    // Check hostname
    if (!parsed.hostname) {
      return {
        valid: false,
        error: 'Hostname is required in Redis URL',
      };
    }

    const port = parsed.port || '6379';

    return {
      valid: true,
      details: {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port,
        hasAuth: !!parsed.password,
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid URL format. Expected format: redis://[username:password@]host[:port][/database]`,
    };
  }
};

/**
 * Calculates retry delay with exponential backoff
 * @param retries Number of retry attempts
 * @returns Delay in milliseconds or false to stop retrying
 */
const getRetryDelay = (retries: number): number | false => {
  if (retries > MAX_CONNECTION_ATTEMPTS) {
    logger.warn(
      `Redis: Maximum connection attempts (${MAX_CONNECTION_ATTEMPTS}) reached. Giving up.`
    );
    return false;
  }
  
  // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms, max 3000ms
  const delay = Math.min(retries * 100 * Math.pow(2, retries - 1), 3000);
  logger.info(`Redis: Retry attempt ${retries}/${MAX_CONNECTION_ATTEMPTS} in ${delay}ms`);
  
  return delay;
};

/**
 * Performs Redis health check
 * @returns Health check result
 */
export const checkRedisHealth = async (): Promise<{
  connected: boolean;
  responsive: boolean;
  latency?: number;
  error?: string;
}> => {
  if (!redisEnabled || !redisClient || !redisClient.isReady) {
    return {
      connected: false,
      responsive: false,
      error: 'Redis client is not connected',
    };
  }

  try {
    const startTime = Date.now();
    await redisClient.ping();
    const latency = Date.now() - startTime;

    return {
      connected: true,
      responsive: true,
      latency,
    };
  } catch (error: any) {
    return {
      connected: true,
      responsive: false,
      error: error.message,
    };
  }
};

/**
 * Connect to Redis server with retry logic and health checks
 */
export const connectRedis = async (): Promise<void> => {
  try {
    // Check if REDIS_URL is provided
    if (!process.env.REDIS_URL) {
      logger.info('Redis: REDIS_URL not configured. Caching will be disabled.');
      redisEnabled = false;
      return;
    }

    // Validate Redis URL
    const validation = validateRedisUrl(process.env.REDIS_URL);
    if (!validation.valid) {
      logger.error(`Redis: Invalid URL - ${validation.error}`);
      logger.error(`Redis: Current REDIS_URL format is incorrect`);
      logger.error(`Redis: Expected format: redis://[username:password@]host[:port][/database]`);
      redisEnabled = false;
      return;
    }

    // Log connection attempt (without sensitive info)
    const { details } = validation;
    logger.info(
      `Redis: Connecting to ${details!.hostname}:${details!.port} ${
        details!.hasAuth ? '(with authentication)' : '(no authentication)'
      }`
    );

    // Create Redis client with retry configuration
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          connectionAttempts = retries;
          return getRetryDelay(retries);
        },
        connectTimeout: 10000, // 10 second timeout
      },
      // Ping interval to detect dead connections
      pingInterval: 1000,
    });

    // Event handlers for connection lifecycle
    redisClient.on('error', (err: any) => {
      // Reduce log noise - only log unique or important errors
      if (err.code === 'ECONNREFUSED') {
        if (connectionAttempts <= 1) {
          // Only log on first attempt to reduce noise
          logger.error(
            `Redis: Connection refused at ${err.address || 'unknown address'}`
          );
        }
      } else if (err.code === 'ETIMEDOUT') {
        logger.error('Redis: Connection timeout');
      } else if (err.code === 'ENOTFOUND') {
        logger.error(`Redis: Host not found - ${err.hostname}`);
      } else {
        // Log other errors only once
        if (connectionAttempts <= 1) {
          logger.error(`Redis: Error - ${err.message}`);
        }
      }
      redisEnabled = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis: Connected to server');
    });

    redisClient.on('ready', () => {
      logger.info('Redis: Client ready and operational');
      redisEnabled = true;
      connectionAttempts = 0; // Reset counter on successful connection
    });

    redisClient.on('reconnecting', () => {
      if (connectionAttempts === 1) {
        // Only log first reconnection attempt
        logger.info('Redis: Connection lost, attempting to reconnect...');
      }
    });

    redisClient.on('end', () => {
      logger.info('Redis: Connection closed');
      redisEnabled = false;
    });

    // Attempt connection with timeout
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Connection timeout after 10 seconds')),
          10000
        )
      ),
    ]);

    // Verify connection with health check
    const health = await checkRedisHealth();
    if (health.connected && health.responsive) {
      logger.info(
        `Redis: Health check passed (latency: ${health.latency}ms)`
      );
      redisEnabled = true;
    } else {
      logger.warn(
        `Redis: Health check failed - ${health.error || 'Unknown error'}`
      );
      redisEnabled = false;
    }
  } catch (error: any) {
    // Detailed error logging with troubleshooting hints
    
    logger.error('Redis: Connection Failed');
   
    if (error.code === 'ECONNREFUSED') {
      logger.error('Issue: Connection refused');
      logger.error('Solutions:');
      logger.error('  1. Verify Redis is running: redis-cli ping');
      logger.error('  2. Check Docker: docker ps | grep redis');
      logger.error('  3. Verify REDIS_URL in .env file');
    } else if (error.message?.includes('timeout')) {
      logger.error('Issue: Connection timeout');
      logger.error('Solutions:');
      logger.error('  1. Check network connectivity');
      logger.error('  2. Verify Redis server is responsive');
      logger.error('  3. Check firewall settings');
    } else {
      logger.error(`Issue: ${error.message}`);
    }

    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.warn('Redis: Application will continue without caching');

    redisEnabled = false;

    // Clean up failed client
    if (redisClient) {
      try {
        await redisClient.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      redisClient = null;
    }
  }
};

/**
 * Get value from Redis cache
 * @param key Cache key
 * @returns The cached value or null if not found or Redis unavailable
 */
export const cacheGet = async (key: string): Promise<any> => {
  if (!redisEnabled || !redisClient?.isReady) {
    return null;
  }

  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error: any) {
    // Reduce log noise - only log parsing errors
    if (error instanceof SyntaxError) {
      logger.error(`Redis: Failed to parse cached value for key '${key}'`);
    }
    return null;
  }
};

/**
 * Set value in Redis cache
 * @param key Cache key
 * @param value Value to cache
 * @param ttl Time to live in seconds (default: 1 hour)
 * @returns true if successful, false otherwise
 */
export const cacheSet = async (
  key: string,
  value: any,
  ttl: number = 3600
): Promise<boolean> => {
  if (!redisEnabled || !redisClient?.isReady) {
    return false;
  }

  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttl });
    return true;
  } catch (error: any) {
    logger.error(`Redis: Failed to set cache for key '${key}': ${error.message}`);
    return false;
  }
};

/**
 * Delete value from Redis cache
 * @param key Cache key
 * @returns true if successful, false otherwise
 */
export const cacheDelete = async (key: string): Promise<boolean> => {
  if (!redisEnabled || !redisClient?.isReady) {
    return false;
  }

  try {
    await redisClient.del(key);
    return true;
  } catch (error: any) {
    logger.error(`Redis: Failed to delete key '${key}': ${error.message}`);
    return false;
  }
};

/**
 * Clear all keys from current Redis database
 * @returns true if successful, false otherwise
 */
export const cacheClear = async (): Promise<boolean> => {
  if (!redisEnabled || !redisClient?.isReady) {
    return false;
  }

  try {
    await redisClient.flushDb();
    logger.info('Redis: Cache cleared successfully');
    return true;
  } catch (error: any) {
    logger.error(`Redis: Failed to clear cache: ${error.message}`);
    return false;
  }
};

/**
 * Check if Redis is connected and available
 * @returns true if Redis is available, false otherwise
 */
export const isRedisAvailable = (): boolean => {
  return redisEnabled && redisClient?.isReady === true;
};

/**
 * Get Redis connection status with details
 * @returns Detailed connection status
 */
export const getRedisStatus = () => {
  return {
    enabled: redisEnabled,
    connected: redisClient?.isReady === true,
    configured: !!process.env.REDIS_URL,
    connectionAttempts,
  };
};

/**
 * Gracefully disconnect from Redis
 */
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis: Disconnected gracefully');
      redisEnabled = false;
      redisClient = null;
    } catch (error: any) {
      logger.error(`Redis: Error during disconnect: ${error.message}`);
    }
  }
};

// Export default object with all functions
export default {
  connect: connectRedis,
  disconnect: disconnectRedis,
  get: cacheGet,
  set: cacheSet,
  delete: cacheDelete,
  clear: cacheClear,
  isAvailable: isRedisAvailable,
  checkHealth: checkRedisHealth,
  getStatus: getRedisStatus,
  validateUrl: validateRedisUrl,
};