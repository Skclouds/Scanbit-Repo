/**
 * Redis-based Rate Limiter - Industry standard for production
 * - Sliding window per IP
 * - Fallback to in-memory when Redis unavailable
 * - Authenticated requests bypass (configurable)
 */

import { redisExec, redisKey } from '../config/redis.js';
import { config } from '../config/environment.js';
import { logSuspicious } from '../utils/logger.js';
import { SimpleRateLimiter } from './security.js';

function getClientIp(req) {
  return (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Redis sliding window rate limit
 * Uses INCR + EXPIRE for atomic counter per key
 */
async function redisRateLimit(ip, windowMs, maxRequests, keyPrefix) {
  const key = redisKey(keyPrefix, ip);
  const now = Date.now();
  const windowStart = now - windowMs;

  const result = await redisExec(async (client) => {
    const multi = client.multi();
    multi.zadd(key, now, `${now}-${Math.random()}`);
    multi.zremrangebyscore(key, 0, windowStart);
    multi.zcard(key);
    multi.expire(key, Math.ceil(windowMs / 1000) + 60);
    const results = await multi.exec();
    return results?.[2]?.[1] ?? 0;
  });

  return result !== null ? result : -1;
}

/**
 * Create Redis-backed rate limiter with in-memory fallback
 */
export function createRedisRateLimiter(options = {}) {
  const {
    windowMs = config.rateLimit.windowMs,
    maxRequests = config.rateLimit.maxRequests,
    keyPrefix = 'ratelimit',
    skipWhen = null,
    onLimitReached = null,
  } = options;

  const inMemoryFallback = new SimpleRateLimiter(windowMs, maxRequests, onLimitReached, skipWhen);

  return async (req, res, next) => {
    if (skipWhen && skipWhen(req)) return next();

    const ip = getClientIp(req);

    const count = await redisRateLimit(ip, windowMs, maxRequests, keyPrefix);

    if (count === -1) {
      return inMemoryFallback.middleware()(req, res, next);
    }

    if (count > maxRequests) {
      if (onLimitReached) onLimitReached(req, ip);
      else logSuspicious('Rate limit exceeded', { ip, path: req.path });
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        errorCode: 'RATE_LIMIT_EXCEEDED',
      });
    }

    next();
  };
}

/** Stricter Redis rate limiter for auth routes (login, register, OTP) */
export function createAuthRedisRateLimiter() {
  return createRedisRateLimiter({
    windowMs: config.rateLimit.windowMs,
    maxRequests: config.rateLimit.authMaxRequests ?? 50,
    keyPrefix: 'rl:auth',
    onLimitReached: (req, ip) =>
      logSuspicious('Auth rate limit exceeded', { ip, path: req.path }),
    // Skip GET /me entirely - session check called often by frontend, not a brute-force target
    skipWhen: (req) =>
      req.method === 'GET' &&
      (req.path === '/me' || req.path?.endsWith('/auth/me') || (req.originalUrl && req.originalUrl.includes('/auth/me'))),
  });
}

export default createRedisRateLimiter;
