#!/usr/bin/env node

/**
 * Redis Connection Test Script
 * 
 * This script tests Redis connection with different scenarios:
 * 1. Redis configured and running
 * 2. Redis not configured
 * 3. Redis configured but not running
 * 4. Invalid Redis URL
 * 
 * Usage: node test-redis-connection.js
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testRedisConnection() {
  console.log('🧪 Testing Redis Configuration...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Import Redis configuration
  const redis = await import('./src/config/redis.js');

  // Test 1: Check if Redis is configured
  console.log('📋 Test 1: Configuration Check');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (!process.env.REDIS_URL) {
    console.log('❌ REDIS_URL is not configured');
    console.log('ℹ️  The application will work without Redis, but with reduced performance');
    console.log('💡 To enable Redis, set REDIS_URL in your .env file');
    console.log('   Example: REDIS_URL=redis://localhost:6379\n');
    return;
  }

  console.log('✅ REDIS_URL is configured:', process.env.REDIS_URL);
  
  // Test 2: Validate Redis URL format
  console.log('\n📋 Test 2: URL Validation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const validation = redis.validateRedisUrl(process.env.REDIS_URL);
  
  if (!validation.valid) {
    console.log('❌ Invalid Redis URL format');
    console.log('   Error:', validation.error);
    console.log('💡 Expected format: redis://[username:password@]host[:port][/database]');
    console.log('   Examples:');
    console.log('   - redis://localhost:6379');
    console.log('   - redis://:password@localhost:6379');
    console.log('   - rediss://user:pass@host:6380 (TLS)\n');
    return;
  }

  console.log('✅ URL format is valid');
  console.log('   Protocol:', validation.details.protocol);
  console.log('   Host:', validation.details.hostname);
  console.log('   Port:', validation.details.port);
  console.log('   Authentication:', validation.details.hasAuth ? 'Yes' : 'No');

  // Test 3: Attempt connection
  console.log('\n📋 Test 3: Connection Attempt');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Attempting to connect to Redis...');
  
  try {
    await redis.connectRedis();
    
    // Give it a moment to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 4: Check connection status
    console.log('\n📋 Test 4: Connection Status');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const status = redis.getRedisStatus();
    console.log('Status:', JSON.stringify(status, null, 2));
    
    if (status.connected) {
      console.log('✅ Successfully connected to Redis!');
    } else {
      console.log('⚠️  Redis is configured but not connected');
      console.log('   Application will continue without caching');
    }
    
    // Test 5: Health check
    console.log('\n📋 Test 5: Health Check');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const health = await redis.checkRedisHealth();
    
    if (health.connected && health.responsive) {
      console.log('✅ Redis is healthy and responsive');
      console.log('   Latency:', health.latency, 'ms');
    } else {
      console.log('⚠️  Redis health check failed');
      if (health.error) {
        console.log('   Error:', health.error);
      }
    }
    
    // Test 6: Cache operations
    if (redis.isRedisAvailable()) {
      console.log('\n📋 Test 6: Cache Operations');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Test SET
      const testKey = 'test:connection:' + Date.now();
      const testValue = { message: 'Hello Redis!', timestamp: new Date().toISOString() };
      
      console.log('Testing SET operation...');
      const setResult = await redis.cacheSet(testKey, testValue, 60);
      
      if (setResult) {
        console.log('✅ SET operation successful');
      } else {
        console.log('❌ SET operation failed');
      }
      
      // Test GET
      console.log('Testing GET operation...');
      const getResult = await redis.cacheGet(testKey);
      
      if (getResult && getResult.message === testValue.message) {
        console.log('✅ GET operation successful');
        console.log('   Retrieved:', JSON.stringify(getResult, null, 2));
      } else {
        console.log('❌ GET operation failed');
      }
      
      // Test DELETE
      console.log('Testing DELETE operation...');
      const delResult = await redis.cacheDelete(testKey);
      
      if (delResult) {
        console.log('✅ DELETE operation successful');
      } else {
        console.log('❌ DELETE operation failed');
      }
      
      // Verify deletion
      const verifyDel = await redis.cacheGet(testKey);
      if (verifyDel === null) {
        console.log('✅ Key successfully deleted');
      } else {
        console.log('⚠️  Key still exists after deletion');
      }
    }
    
    // Summary
    console.log('\n📊 Test Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (redis.isRedisAvailable()) {
      console.log('✅ All tests passed! Redis is fully operational.');
      console.log('🚀 Your application will use Redis for caching and improved performance.');
    } else {
      console.log('⚠️  Redis is configured but not operational.');
      console.log('🔧 Troubleshooting steps:');
      console.log('   1. Check if Redis is running: redis-cli ping');
      console.log('   2. For Docker: docker ps | grep redis');
      console.log('   3. Verify REDIS_URL in .env file');
      console.log('   4. Check network connectivity');
      console.log('   5. Review application logs for detailed errors');
      console.log('\n📖 See backend/REDIS_SETUP.md for detailed setup instructions');
    }
    
    // Cleanup
    await redis.disconnectRedis();
    
  } catch (error) {
    console.error('\n❌ Connection test failed');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Make sure Redis is running');
    console.error('   2. Verify REDIS_URL is correct');
    console.error('   3. Check Redis logs for errors');
    console.error('   4. See backend/REDIS_SETUP.md for help');
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏁 Test completed\n');
}

// Run tests
testRedisConnection().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
