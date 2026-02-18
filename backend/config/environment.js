/**
 * Professional Environment Configuration
 * Centralizes all environment variable handling with validation
 */
import dotenv from 'dotenv';


// Load environment variables
dotenv.config();

// Environment validation
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'PORT'
];

const optionalEnvVars = {
  NODE_ENV: 'development',
  FRONTEND_URL: 'http://localhost:8080',
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_SECURE: 'false',
  SMTP_USER: '',
  SMTP_PASS: '',
  CLOUDINARY_CLOUD_NAME: '',
  CLOUDINARY_API_KEY: '',
  CLOUDINARY_API_SECRET: '',
  RAZORPAY_KEY_ID: '',
  RAZORPAY_KEY_SECRET: '',
  MASTER_ADMIN_EMAIL: 'admin@scanbit.com',
  RATE_LIMIT_WINDOW_MS: '900000', // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: '500',
  RATE_LIMIT_AUTH_MAX_REQUESTS: '10',
  JWT_EXPIRES_IN: '7d', // Consider shorter (e.g. 15m) with refresh tokens for production
  OTP_EXPIRES_IN: '300000', // 5 minutes
  PASSWORD_RESET_EXPIRES_IN: '3600000', // 1 hour
  MAX_FILE_SIZE: '10485760', // 10MB
  ALLOWED_FILE_TYPES: 'image/jpeg,image/png,image/gif,image/webp',
  REDIS_URL: '',
  REDIS_HOST: '127.0.0.1',
  REDIS_PORT: '6379',
  REDIS_PASSWORD: '',
  REDIS_DB: '0',
  REDIS_KEY_PREFIX: 'scanbit:',
  COOKIE_DOMAIN: '',
  COOKIE_NAME: 'token',
  COOKIE_SAME_SITE: 'None',
  COOKIE_SECURE: 'true',
};

const logError = (message) => { console.error('[ScanBit]', message); };
const logInfo = (message) => { if (process.env.LOG_CONFIG === 'true') console.log('[ScanBit]', message); };

// Validate required environment variables
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logError(`Missing required env vars: ${missingEnvVars.join(', ')}`);
  logError('Create .env from .env.example and try again.');
  process.exit(1);
}

// Validate JWT_SECRET strength
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  logError('JWT_SECRET must be at least 32 characters long.');
  process.exit(1);
}

// Environment configuration object
export const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT) || 5000,
    environment: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  },

  // Database configuration
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    algorithm: 'HS256'
  },

  // CORS configuration (iOS Safari, mobile browsers)
  // In production, normalize http -> https for all origins
  cors: {
    origins: (() => {
      const isProd = process.env.NODE_ENV === 'production';
      const ensureHttps = (u) => (isProd && u.startsWith('http://') ? u.replace(/^http:\/\//i, 'https://') : u);
      const raw = process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
        : ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173', 'http://localhost:5174'];
      return raw.map(ensureHttps);
    })(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    maxAge: 86400
  },

  // Email configuration
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },

  // Cloudinary configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },

  // Payment configuration
  payment: {
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET
    }
  },

  // Redis configuration (optional - rate limiting, caching)
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'scanbit:',
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 2000,   // general API per IP per window
    authMaxRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS) || 200, // login/register/OTP per window; GET /me is excluded
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
  },

  // Security configuration
  security: {
    masterAdminEmail: process.env.MASTER_ADMIN_EMAIL || 'admin@scanbit.com',
    otpExpiresIn: parseInt(process.env.OTP_EXPIRES_IN) || 5 * 60 * 1000, // 5 minutes
    passwordResetExpiresIn: parseInt(process.env.PASSWORD_RESET_EXPIRES_IN) || 60 * 60 * 1000, // 1 hour
    bcryptRounds: 12
  },

  // Cookie configuration (cross-site auth: www.scanbit.in <-> server.scanbit.in)
  // Set COOKIE_DOMAIN=.scanbit.in in production so cookie works for all subdomains
  cookie: (() => {
    const jwtExp = process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '7d';
    let maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    const match = jwtExp.match(/^(\d+)([smhd])$/);
    if (match) {
      const [, n, unit] = match;
      const num = parseInt(n, 10);
      if (unit === 's') maxAgeMs = num * 1000;
      else if (unit === 'm') maxAgeMs = num * 60 * 1000;
      else if (unit === 'h') maxAgeMs = num * 60 * 60 * 1000;
      else if (unit === 'd') maxAgeMs = num * 24 * 60 * 60 * 1000;
    }
    const domain = process.env.COOKIE_DOMAIN || optionalEnvVars.COOKIE_DOMAIN;
    const secure = process.env.COOKIE_SECURE !== undefined
      ? process.env.COOKIE_SECURE === 'true'
      : (process.env.NODE_ENV === 'production');
    return {
      name: process.env.COOKIE_NAME || optionalEnvVars.COOKIE_NAME,
      domain: domain || undefined,
      sameSite: (process.env.COOKIE_SAME_SITE || optionalEnvVars.COOKIE_SAME_SITE) || 'Lax',
      secure,
      maxAge: maxAgeMs,
      httpOnly: true,
    };
  })(),

  // Application configuration
  app: {
    name: 'ScanBit',
    version: '1.0.0',
    description: 'Digital Menu and Business Management Platform',
    supportEmail: 'support@scanbit.com'
  }
};

// Validate configuration
const redactMongoUri = (uri) => {
  if (!uri) return '';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^@]+)@/i, '$1<redacted>@');
};

export const validateConfig = () => {
  const errors = [];

  // Validate database URI
  if (!config.database.uri || !config.database.uri.startsWith('mongodb')) {
    errors.push('MONGODB_URI must be a valid MongoDB connection string');
  }

  // Validate JWT secret
  if (!config.jwt.secret || config.jwt.secret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  // Validate email configuration if provided
  if (config.email.auth.user && !config.email.auth.pass) {
    errors.push('SMTP_PASS is required when SMTP_USER is provided');
  }

  // Validate Cloudinary configuration if provided
  const cloudinaryFields = ['cloudName', 'apiKey', 'apiSecret'];
  const providedCloudinaryFields = cloudinaryFields.filter(field => config.cloudinary[field]);
  if (providedCloudinaryFields.length > 0 && providedCloudinaryFields.length < 3) {
    errors.push('All Cloudinary fields (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) must be provided together');
  }

  // Validate Razorpay configuration if provided
  const razorpayFields = ['keyId', 'keySecret'];
  const providedRazorpayFields = razorpayFields.filter(field => config.payment.razorpay[field]);
  if (providedRazorpayFields.length > 0 && providedRazorpayFields.length < 2) {
    errors.push('Both Razorpay fields (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) must be provided together');
  }

  if (errors.length > 0) {
    errors.forEach(error => logError(error));
    process.exit(1);
  }

  // Configuration validated successfully
  logInfo('Configuration validated.');
};

// Log configuration - only when LOG_CONFIG=true (minimal by default)
export const logConfig = () => {
  if (process.env.LOG_CONFIG === 'true') {
    const redacted = redactMongoUri(config.database.uri);
    console.log(`[ScanBit] ${config.server.environment} | port ${config.server.port} | DB connected`);
  }
};

export default config;