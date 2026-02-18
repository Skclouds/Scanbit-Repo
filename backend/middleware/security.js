import { config } from '../config/environment.js';
import { logSuspicious } from '../utils/logger.js';

/**
 * Additional security headers not covered by Helmet
 * Use after Helmet middleware
 */
export const additionalSecurityHeaders = (req, res, next) => {
  // Permissions-Policy (Feature-Policy) - restrict browser features
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );
  next();
};

/**
 * Get client IP - Cloudflare uses CF-Connecting-IP, otherwise X-Forwarded-For
 */
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
 * Simple rate limiter middleware
 * Tracks requests per IP in memory
 * For production, use Redis-based rate limiting
 */
export class SimpleRateLimiter {
  constructor(windowMs = 15 * 60 * 1000, maxRequests = 1000, onLimitReached = null, skipWhen = null) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.onLimitReached = onLimitReached;
    this.skipWhen = skipWhen;
    this.requests = new Map();
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < this.windowMs);
      if (validRequests.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, validRequests);
      }
    }
  }

  middleware() {
    return (req, res, next) => {
      if (this.skipWhen && this.skipWhen(req)) return next();

      if (Math.random() < 0.1) this.cleanup();

      const ip = getClientIp(req);
      const now = Date.now();
      const requests = this.requests.get(ip) || [];

      // Remove requests older than the window
      const validRequests = requests.filter(time => now - time < this.windowMs);

      if (validRequests.length >= this.maxRequests) {
        if (this.onLimitReached) this.onLimitReached(req, ip);
        else logSuspicious('Rate limit exceeded', { ip, path: req.path });
        return res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later',
          errorCode: 'RATE_LIMIT_EXCEEDED'
        });
      }

      validRequests.push(now);
      this.requests.set(ip, validRequests);
      next();
    };
  }
}

/**
 * Request logging middleware - minimal in production
 */
export const requestLogger = (req, res, next) => {
  // Only log errors in production, full logging in development
  if (process.env.NODE_ENV === 'development') {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (res.statusCode >= 400) {
        // Request finished with error status (logging disabled for production)
      }
    });
  }
  
  next();
};

/**
 * API key validation middleware (for protected endpoints)
 */
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Invalid API key'
    });
  }
  
  next();
};

/** Stricter rate limiter for auth routes (login, register, OTP) - brute-force protection */
export const createAuthRateLimiter = () => {
  const onAuthLimit = (req, ip) => logSuspicious('Auth rate limit exceeded', { ip, path: req.path });
  const limiter = new SimpleRateLimiter(
    config.rateLimit.windowMs,
    config.rateLimit.authMaxRequests ?? 10,
    onAuthLimit
  );
  return limiter.middleware();
};

export default {
  additionalSecurityHeaders,
  SimpleRateLimiter,
  createAuthRateLimiter,
  requestLogger,
  validateApiKey
};
