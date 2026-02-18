/**
 * Redis Configuration - Production-ready with security best practices
 * - TLS in production
 * - Connection validation
 * - Graceful fallback when Redis unavailable
 * - Key prefix for namespace isolation
 */

import Redis from 'ioredis';
import { config } from './environment.js';

const KEY_PREFIX = process.env.REDIS_KEY_PREFIX || 'scanbit:';
const isProduction = config.server.isProduction;

/** Build Redis connection options */
function getRedisOptions() {
  const url = process.env.REDIS_URL;
  if (url && url.startsWith('rediss://')) {
    return {
      ...parseRedisUrl(url),
      tls: { rejectUnauthorized: isProduction },
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 2000)),
      connectTimeout: 10000,
      lazyConnect: true,
      enableReadyCheck: true,
      enableOfflineQueue: false,
    };
  }
  if (url) {
    return {
      ...parseRedisUrl(url),
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 2000)),
      connectTimeout: 10000,
      lazyConnect: true,
      enableReadyCheck: true,
    };
  }
  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 2000)),
    connectTimeout: 10000,
    lazyConnect: true,
    enableReadyCheck: true,
  };
}

function parseRedisUrl(url) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: parseInt(u.port, 10) || 6379,
      password: u.password || undefined,
      db: parseInt((u.pathname || '/0').slice(1), 10) || 0,
    };
  } catch {
    return {};
  }
}

let redisClient = null;
let isRedisAvailable = false;

/**
 * Get Redis client - creates connection if not exists
 * Returns null if Redis is not configured
 */
export async function getRedis() {
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    return null;
  }
  if (redisClient && isRedisAvailable) return redisClient;
  if (redisClient) {
    try {
      await redisClient.ping();
      isRedisAvailable = true;
      return redisClient;
    } catch {
      redisClient = null;
    }
  }
  try {
    const options = getRedisOptions();
    redisClient = new Redis(options);
    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      if (process.env.LOG_LEVEL === 'debug') {
        console.error('[Redis]', err.message);
      }
    });
    redisClient.on('connect', () => { isRedisAvailable = true; });
    redisClient.on('close', () => { isRedisAvailable = false; });
    await redisClient.ping();
    isRedisAvailable = true;
    return redisClient;
  } catch (err) {
    redisClient = null;
    isRedisAvailable = false;
    return null;
  }
}

/**
 * Prefixed key - namespace isolation, prevents key collision
 */
export function redisKey(...parts) {
  return KEY_PREFIX + parts.filter(Boolean).join(':');
}

/**
 * Execute Redis command with error handling
 */
export async function redisExec(fn) {
  const client = await getRedis();
  if (!client) return null;
  try {
    return await fn(client);
  } catch {
    return null;
  }
}

/**
 * Close Redis connection (graceful shutdown)
 */
export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isRedisAvailable = false;
  }
}

/**
 * Check if Redis is available
 */
export function isRedisConnected() {
  return !!redisClient && isRedisAvailable;
}

export default { getRedis, redisKey, redisExec, closeRedis, isRedisConnected };
