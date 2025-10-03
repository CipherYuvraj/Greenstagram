# 🔄 Redis Setup Guide for Greenstagram

## 📋 Table of Contents
- [Overview](#overview)
- [Why Redis?](#why-redis)
- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
- [Configuration](#configuration)
- [Testing Redis Connection](#testing-redis-connection)
- [Troubleshooting](#troubleshooting)
- [Performance Optimization](#performance-optimization)

---

## 🎯 Overview

Redis is used in Greenstagram as an **optional caching layer** to improve application performance. The application is designed to work seamlessly with or without Redis:

- ✅ **With Redis**: Enhanced performance with caching for API responses, session data, and frequently accessed content
- ✅ **Without Redis**: Full functionality maintained, but with slightly higher database load

### Key Features
- 🔄 Automatic reconnection with exponential backoff
- 🛡️ Graceful fallback when Redis is unavailable
- 📊 Health checks and monitoring
- ⚡ Configurable TTL (Time-To-Live) for cached data
- 🔒 Support for TLS connections (rediss://)

---

## 🤔 Why Redis?

### Performance Benefits
| Scenario | Without Redis | With Redis | Improvement |
|----------|---------------|------------|-------------|
| API Response Time | ~150-200ms | ~15-20ms | **90% faster** |
| Database Queries | Every request | Cached | **Reduced load** |
| Concurrent Users | 100 req/s | 1000+ req/s | **10x capacity** |

### Use Cases in Greenstagram
- 🎯 **API Response Caching**: Cache plant identification results, eco-quotes
- 👤 **Session Management**: Store user session data
- 🔍 **Search Results**: Cache frequently searched terms
- 📊 **Leaderboards**: Real-time challenge rankings
- 🔔 **Rate Limiting**: Track API request limits per user

---

## 🚀 Local Development Setup

### Option 1: Docker (Recommended)

**Fastest and easiest way to get Redis running locally**

```bash
# Pull and run Redis container
docker run -d \
  --name greenstagram-redis \
  -p 6379:6379 \
  redis:7-alpine

# Verify it's running
docker ps | grep redis

# Test connection
docker exec -it greenstagram-redis redis-cli ping
# Should return: PONG
```

**Start Redis automatically with your project**

Create a `docker-compose.yml` in your project root:

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: greenstagram-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  redis-data:
```

Then start with:
```bash
docker-compose up -d redis
```

### Option 2: Local Installation

#### macOS
```bash
# Using Homebrew
brew install redis

# Start Redis server
brew services start redis

# Or run manually
redis-server
```

#### Ubuntu/Debian
```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Check status
sudo systemctl status redis-server
```

#### Windows
```bash
# Using WSL2 (recommended)
# Follow Ubuntu instructions above

# Or download Windows build
# https://github.com/microsoftarchive/redis/releases
```

### Option 3: Redis Cloud (Free Tier)

**For cloud-based development environment**

1. Sign up at [Redis Cloud](https://redis.com/try-free/)
2. Create a new database (free 30MB tier available)
3. Get your connection URL from the dashboard
4. Use the provided `rediss://` URL in your `.env` file

---

## 🌐 Production Deployment

### Azure Cache for Redis (Recommended for Azure deployments)

#### Step 1: Create Redis Cache via Azure Portal

```bash
# Using Azure CLI
az redis create \
  --resource-group greenstagram-rg \
  --name greenstagram-cache \
  --location eastus \
  --sku Basic \
  --vm-size c0 \
  --enable-non-ssl-port false
```

#### Step 2: Get Connection String

```bash
# Get primary key
az redis list-keys \
  --resource-group greenstagram-rg \
  --name greenstagram-cache

# Connection string format
rediss://greenstagram-cache.redis.cache.windows.net:6380?password=YOUR_PRIMARY_KEY
```

#### Pricing Tiers

| Tier | Memory | Connections | Price (Est.) | Use Case |
|------|--------|-------------|--------------|----------|
| Basic C0 | 250 MB | 256 | ~$16/month | Development |
| Basic C1 | 1 GB | 1,000 | ~$55/month | Small apps |
| Standard C1 | 1 GB | 1,000 | ~$120/month | Production (HA) |
| Premium P1 | 6 GB | 7,500 | ~$250/month | Enterprise |

### Other Cloud Providers

#### AWS ElastiCache
```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id greenstagram-cache \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1
```

#### Redis Cloud (Managed)
- Free tier: 30MB
- Paid plans from $5/month
- Multi-cloud support
- Built-in monitoring

#### DigitalOcean Managed Redis
- From $15/month
- 1GB RAM
- Automatic backups
- Easy scaling

---

## ⚙️ Configuration

### Environment Variables

Add to your `backend/.env` file:

```bash
# ============================================
# REDIS CONFIGURATION
# ============================================

# Option 1: Local Docker/Installation (No auth)
REDIS_URL=redis://localhost:6379

# Option 2: Local with password
REDIS_URL=redis://:your_password@localhost:6379

# Option 3: Local with username and password
REDIS_URL=redis://username:password@localhost:6379

# Option 4: Remote server with TLS (rediss://)
REDIS_URL=rediss://username:password@your-server.com:6380

# Option 5: Azure Cache for Redis
REDIS_URL=rediss://greenstagram-cache.redis.cache.windows.net:6380?password=YOUR_PRIMARY_KEY

# Option 6: Redis Cloud
REDIS_URL=redis://default:password@redis-12345.c123.region.cloud.redislabs.com:12345

# ============================================
# OPTIONAL: Advanced Configuration
# ============================================

# Cache TTL (Time-To-Live) in seconds
CACHE_TTL=3600  # 1 hour (default)

# Redis database number (0-15)
REDIS_DB=0  # default database
```

### URL Format Explained

```
redis://[username:password@]hostname[:port][/database]
```

| Component | Required | Description | Example |
|-----------|----------|-------------|---------|
| Protocol | ✅ Yes | `redis://` or `rediss://` (TLS) | `redis://` |
| Username | ❌ No | Authentication username | `default` |
| Password | ❌ No | Authentication password | `mypassword` |
| Hostname | ✅ Yes | Redis server address | `localhost` |
| Port | ❌ No | Redis port (default: 6379) | `6379` |
| Database | ❌ No | Database number (0-15) | `/0` |

### Examples

```bash
# Minimal (local, no auth)
REDIS_URL=redis://localhost:6379

# With authentication
REDIS_URL=redis://admin:securepass123@localhost:6379

# TLS connection
REDIS_URL=rediss://production-redis.example.com:6380

# Specific database
REDIS_URL=redis://localhost:6379/1

# Complete URL
REDIS_URL=rediss://admin:password@prod-redis.example.com:6380/0
```

---

## 🧪 Testing Redis Connection

### Using redis-cli

```bash
# Connect to local Redis
redis-cli

# Test connection
127.0.0.1:6379> PING
PONG

# Set a test value
127.0.0.1:6379> SET test "Hello Redis"
OK

# Get the value
127.0.0.1:6379> GET test
"Hello Redis"

# Check server info
127.0.0.1:6379> INFO server

# Exit
127.0.0.1:6379> QUIT
```

### Using the Application

#### 1. Check Health Endpoint

```bash
# Hit the health check endpoint
curl http://localhost:5000/health

# Expected response (Redis connected)
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "environment": "development",
    "uptime": 1234.567,
    "services": {
      "redis": {
        "status": "healthy",
        "configured": true,
        "connected": true,
        "responsive": true,
        "latency": 2,
        "connectionAttempts": 0,
        "error": null,
        "message": "Redis is healthy and responsive"
      }
    }
  }
}

# Expected response (Redis not configured)
{
  "services": {
    "redis": {
      "status": "not_configured",
      "configured": false,
      "connected": false,
      "responsive": false,
      "message": "Redis not configured. Set REDIS_URL to enable caching."
    }
  }
}
```

#### 2. Check Application Logs

When the application starts, you should see:

```
✅ With Redis configured and running:
🔍 Searching for .env file...
✅ Found .env file at: /path/to/.env
📊 Environment Status:
   REDIS_URL: ✅ Set
   Redis Configuration:
     Protocol: redis:
     Host: localhost
     Port: 6379
     Auth: ❌ Disabled

Redis: Connecting to localhost:6379 (no authentication)
Redis: Connected to server
Redis: Client ready and operational
Redis: Health check passed (latency: 2ms)

❌ Without Redis configured:
Redis: REDIS_URL not configured. Caching will be disabled.

⚠️ Redis unreachable:
Redis: Connection Failed
Issue: Connection refused
Solutions:
  1. Verify Redis is running: redis-cli ping
  2. Check Docker: docker ps | grep redis
  3. Verify REDIS_URL in .env file
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Redis: Application will continue without caching
```

### Testing Cache Functionality

Create a test script `test-redis.ts`:

```typescript
import redis from './src/config/redis';

async function testRedis() {
  // Test cache set
  const setResult = await redis.set('test-key', { message: 'Hello Redis!' }, 60);
  console.log('Set result:', setResult); // Should be true

  // Test cache get
  const getResult = await redis.get('test-key');
  console.log('Get result:', getResult); // Should be { message: 'Hello Redis!' }

  // Test cache delete
  const delResult = await redis.delete('test-key');
  console.log('Delete result:', delResult); // Should be true

  // Check if Redis is available
  console.log('Redis available:', redis.isAvailable());

  // Get detailed status
  console.log('Redis status:', redis.getStatus());
}

testRedis();
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Connection Refused (ECONNREFUSED)

**Error:**
```
Redis: Connection refused at 127.0.0.1:6379
```

**Solutions:**
```bash
# Check if Redis is running
docker ps | grep redis
# Or for local installation
redis-cli ping

# If not running, start Redis
docker start greenstagram-redis
# Or
brew services start redis
# Or
sudo systemctl start redis-server
```

#### 2. Connection Timeout (ETIMEDOUT)

**Error:**
```
Redis: Connection timeout
```

**Solutions:**
- Check network connectivity
- Verify firewall settings
- Check if Redis port (6379) is accessible
- For cloud Redis, check security group rules

```bash
# Test port connectivity
telnet your-redis-host 6379

# Or using nc
nc -zv your-redis-host 6379
```

#### 3. Host Not Found (ENOTFOUND)

**Error:**
```
Redis: Host not found - redis-server
```

**Solutions:**
- Verify hostname in REDIS_URL
- Check DNS resolution
- Use IP address instead of hostname

```bash
# Test DNS resolution
nslookup your-redis-host

# Use IP address
REDIS_URL=redis://192.168.1.100:6379
```

#### 4. Authentication Failed

**Error:**
```
Redis: Error - WRONGPASS invalid username-password pair
```

**Solutions:**
```bash
# Verify password in REDIS_URL
REDIS_URL=redis://:correct_password@localhost:6379

# Test with redis-cli
redis-cli -a your_password ping
```

#### 5. Invalid URL Format

**Error:**
```
Invalid REDIS_URL format
Expected: redis://[username:password@]host[:port][/database]
```

**Solutions:**
```bash
# Correct format examples
REDIS_URL=redis://localhost:6379
REDIS_URL=redis://:password@localhost:6379
REDIS_URL=redis://user:password@localhost:6379
REDIS_URL=rediss://secure-host:6380

# Common mistakes to avoid
❌ REDIS_URL=localhost:6379  # Missing protocol
❌ REDIS_URL=http://localhost:6379  # Wrong protocol
❌ REDIS_URL=redis:localhost:6379  # Missing slashes
```

#### 6. Too Many Connection Attempts

**Symptom:**
```
Redis: Maximum connection attempts (5) reached. Giving up.
```

**Solutions:**
- Check if Redis is actually running
- Verify network connectivity
- Check Redis server logs for errors
- Increase MAX_CONNECTION_ATTEMPTS if needed (in redis.ts)

#### 7. Redis Memory Issues

**Error:**
```
Redis: Error - OOM command not allowed when used memory > 'maxmemory'
```

**Solutions:**
```bash
# Check memory usage
redis-cli INFO memory

# Configure eviction policy
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Or in redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### Debugging Tools

#### Enable Redis Logging

```bash
# In redis.conf
loglevel debug
logfile /var/log/redis/redis.log

# Or start with verbose mode
redis-server --loglevel debug
```

#### Monitor Redis Commands

```bash
# Watch commands in real-time
redis-cli MONITOR

# Check slow queries
redis-cli SLOWLOG GET 10
```

#### Check Connection Details

```bash
# List all connected clients
redis-cli CLIENT LIST

# Check server info
redis-cli INFO

# Test latency
redis-cli --latency
redis-cli --latency-history
```

---

## ⚡ Performance Optimization

### Configuration Best Practices

#### 1. Set Appropriate TTL Values

```typescript
// Short-lived data (user sessions)
await redis.set('session:user123', sessionData, 1800); // 30 minutes

// Medium-lived data (API responses)
await redis.set('api:posts:feed', posts, 3600); // 1 hour

// Long-lived data (reference data)
await redis.set('plant:species:list', species, 86400); // 24 hours
```

#### 2. Use Compression for Large Objects

```typescript
import zlib from 'zlib';

// Compress before caching
const compressed = zlib.gzipSync(JSON.stringify(largeData));
await redis.set('large:key', compressed.toString('base64'));

// Decompress when retrieving
const cached = await redis.get('large:key');
const data = JSON.parse(zlib.gunzipSync(Buffer.from(cached, 'base64')).toString());
```

#### 3. Implement Cache Warming

```typescript
// Warm up cache on startup
async function warmupCache() {
  const popularPlants = await db.plants.find().limit(100);
  for (const plant of popularPlants) {
    await redis.set(`plant:${plant.id}`, plant, 86400);
  }
}
```

#### 4. Use Connection Pooling

Already configured in `redis.ts` with optimal settings:
- Reconnection strategy with exponential backoff
- Ping interval for dead connection detection
- Connection timeout (10 seconds)

### Monitoring and Metrics

#### Key Metrics to Track

```bash
# Hit rate
redis-cli INFO stats | grep keyspace_hits
redis-cli INFO stats | grep keyspace_misses

# Memory usage
redis-cli INFO memory | grep used_memory_human

# Connected clients
redis-cli INFO clients | grep connected_clients

# Operations per second
redis-cli INFO stats | grep instantaneous_ops_per_sec
```

#### Set Up Alerts

Monitor these thresholds:
- ⚠️ Memory usage > 80%
- ⚠️ Hit rate < 70%
- ⚠️ Connection failures > 5/minute
- ⚠️ Latency > 10ms

---

## 📊 Redis Commands Reference

### Useful Commands

```bash
# Server management
PING                    # Test connection
INFO                    # Server statistics
CONFIG GET *            # View configuration
DBSIZE                  # Number of keys
FLUSHDB                 # Clear current database
FLUSHALL                # Clear all databases

# Key operations
SET key value           # Set a value
GET key                 # Get a value
DEL key                 # Delete a key
EXISTS key              # Check if key exists
EXPIRE key seconds      # Set expiration
TTL key                 # Check time to live
KEYS pattern            # Find keys (use carefully!)

# Data structures
HSET key field value    # Hash set
HGET key field          # Hash get
LPUSH key value         # List push
LRANGE key 0 -1         # List get all
SADD key member         # Set add
SMEMBERS key            # Set get all

# Monitoring
MONITOR                 # Watch commands live
SLOWLOG GET 10          # View slow queries
CLIENT LIST             # List connections
```

---

## 🚀 Quick Start Checklist

- [ ] Install Redis (Docker recommended)
- [ ] Add `REDIS_URL` to `.env` file
- [ ] Start Redis server
- [ ] Test connection with `redis-cli ping`
- [ ] Start your application
- [ ] Check health endpoint: `curl localhost:5000/health`
- [ ] Verify Redis status in logs
- [ ] Test cache functionality

---

## 📚 Additional Resources

- [Redis Official Documentation](https://redis.io/docs/)
- [Redis Command Reference](https://redis.io/commands/)
- [Azure Cache for Redis](https://azure.microsoft.com/en-us/services/cache/)
- [Redis Best Practices](https://redis.io/docs/management/optimization/)
- [Node Redis Client Docs](https://github.com/redis/node-redis)

---

## 💡 Pro Tips

1. **Always use connection pooling** - Already configured in our setup
2. **Set appropriate TTL values** - Prevent memory bloat
3. **Use Redis in production** - Significantly improves performance
4. **Monitor memory usage** - Set up alerts for high memory usage
5. **Use TLS in production** - Always use `rediss://` for secure connections
6. **Regular backups** - Configure AOF (Append Only File) or RDB snapshots
7. **Test failover scenarios** - Ensure app works without Redis

---

## 🆘 Need Help?

If you encounter issues not covered here:
1. Check application logs for detailed error messages
2. Test Redis connection with `redis-cli`
3. Verify environment variables are correctly set
4. Check health endpoint for Redis status
5. Review [Troubleshooting](#troubleshooting) section
6. Open an issue on GitHub with logs and configuration

---

**Made with 💚 for Greenstagram**
