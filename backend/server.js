import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { globalErrorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler.js';
import { httpsRedirect } from './middleware/httpsRedirect.js';
import { connectDatabase, createIndexes, healthCheck } from './config/database.js';
import { getRedis, closeRedis, isRedisConnected } from './config/redis.js';
import { createHelmet } from './config/helmet.js';
import { additionalSecurityHeaders } from './middleware/security.js';
import { createRedisRateLimiter, createAuthRedisRateLimiter } from './middleware/rateLimitRedis.js';
import { config, validateConfig, logConfig } from './config/environment.js';
import { setContentType } from './config/mimeTypes.js';
import businessCategoryRoutes from './routes/businessCategories.js';
import businessInformationRoutes from './routes/businessInformation.js';
import adminAnalyticsRoutes from './routes/adminAnalytics.js';
import advertisementRoutes from './routes/advertisements.js';
import siteSettingsRoutes from './routes/siteSettings.js';
import restaurantRoutes from './routes/restaurants.js';
import categoryRoutes from './routes/categories.js';
import analyticsRoutes from './routes/analytics.js';
import menuItemRoutes from './routes/menuItems.js';
import paymentRoutes from './routes/payments.js';
import supportRoutes from './routes/support.js';
import uploadRoutes from './routes/upload.js';
import publicRoutes from './routes/public.js';
import plansRoutes from './routes/plans.js';
import adminRoutes from './routes/admin.js';
import menuRoutes from './routes/menus.js';
import authRoutes from './routes/auth.js';
import otpRoutes from './routes/otp.js';
import qrRoutes from './routes/qr.js';
import legalDocumentsRoutes from './routes/legalDocuments.js';
import blogsRoutes from './routes/blogs.js';
import reviewRoutes from './routes/reviews.js';
import { startPaymentReminderCron } from './jobs/paymentReminderJob.js';


// Validate configuration on startup
validateConfig();

// Log configuration in development
logConfig();


const app = express();

// Trust proxy when behind a reverse proxy (for correct req.protocol and X-Forwarded-*)
app.set('trust proxy', 1);

// Disable X-Powered-By header (Express signature)
app.disable('x-powered-by');

// Middleware
// HTTPS redirect - in production, redirect HTTP to HTTPS
app.use(httpsRedirect);

// Helmet - industry-standard security headers (CSP, HSTS, X-Frame-Options, etc.)
app.use(createHelmet());
app.use(additionalSecurityHeaders);

// Request logging
app.use(requestLogger);

// Parse cookies (for auth token when using httpOnly cookie)
app.use(cookieParser());

// Rate limiting - Redis when available, else in-memory. Authenticated requests bypass.
const skipWhenAuthenticated = (req) =>
  !!req.headers.authorization?.startsWith('Bearer ');
const rateLimiter = createRedisRateLimiter({
  windowMs: config.rateLimit.windowMs,
  maxRequests: config.rateLimit.maxRequests,
  keyPrefix: 'rl:global',
  skipWhen: skipWhenAuthenticated,
});
app.use(rateLimiter);

// CORS - production: only allowed origins; no wildcard
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      // Mobile apps, webhooks, server-to-server - no Origin header
      return callback(null, true);
    }
    const isAllowed = config.cors.origins.some((allowed) => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return origin === allowed || origin.startsWith(allowed.replace(/\/$/, ''));
    });
    if (isAllowed) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: config.cors.credentials,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders,
  exposedHeaders: config.cors.exposedHeaders || ['Content-Length', 'X-Requested-With'],
  maxAge: config.cors.maxAge ?? 86400,
};
app.use(cors(corsOptions));

// Preflight - use same origin logic (no origin: true)
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from frontend build (production: dist only, no source)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const frontendDistPath = join(__dirname, '../ScanBit-Frontend/dist');
const hasFrontendDist = existsSync(frontendDistPath);

// Block /src/* so source TSX/TS is never served (only compiled assets from /assets)
app.use((req, res, next) => {
  if (req.path.startsWith('/src')) {
    return res.status(404).json({ success: false, message: 'Not found', errorCode: 'NOT_FOUND' });
  }
  next();
});

if (hasFrontendDist) {
  app.use(express.static(frontendDistPath, {
    setHeaders: (res, filePath) => {
      if (setContentType(res, filePath)) {
        if (/\.(js|mjs|css|woff2?|ttf|otf|eot|png|jpg|jpeg|gif|webp|svg|ico|wasm)$/i.test(filePath)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      }
    },
    index: false,
  }));
}

// Root: serve SPA when dist exists; otherwise dev message or 404
app.get('/', (req, res, next) => {
  if (hasFrontendDist) {
    return res.sendFile(join(frontendDistPath, 'index.html'), (err) => err && next());
  }
  if (config.server.isProduction) {
    return res.status(404).json({ success: false, message: 'Not found', errorCode: 'NOT_FOUND' });
  }
  const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
  if (acceptsHtml) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<html><body><h1>ScanBit API</h1><p>Development mode. Build frontend (ScanBit-Frontend/dist) to serve the app.</p></body></html>`);
  } else {
    res.json({ success: true, message: 'ScanBit API', health: '/api/health' });
  }
});

// Routes
app.use('/api/auth', createAuthRedisRateLimiter(), authRoutes);
// Mount reviews first to handle /api/restaurants/:id/reviews before restaurantRoutes
app.use('/api/restaurants', reviewRoutes); 
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/otp', createAuthRedisRateLimiter(), otpRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/legal-documents', legalDocumentsRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/business-categories', businessCategoryRoutes);
app.use('/api/business-information', businessInformationRoutes);

// Health Check - minimal in production
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await healthCheck();
    const redisOk = isRedisConnected();
    const isProd = config.server.isProduction;
    res.json({
      success: true,
      status: 'OK',
      timestamp: new Date().toISOString(),
      ...(isProd ? {} : { version: config.app.version, environment: config.server.environment }),
      database: isProd ? (dbHealth.status === 'connected' ? 'ok' : 'error') : dbHealth,
      redis: isProd ? (redisOk ? 'ok' : 'optional') : (redisOk ? 'connected' : 'not configured'),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service unavailable',
      errorCode: 'HEALTH_CHECK_FAILED',
    });
  }
});

// SPA fallback: serve dist/index.html for non-API, non-file routes (only when dist exists)
if (hasFrontendDist) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    if (req.path.startsWith('/src')) return res.status(404).json({ success: false, message: 'Not found', errorCode: 'NOT_FOUND' });
    if (/\.[a-zA-Z0-9]+$/.test(req.path)) return next();
    res.sendFile(join(frontendDistPath, 'index.html'), (err) => err && next());
  });
}

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Global Error Handling Middleware
app.use(globalErrorHandler);

// Database Connection and Server Startup
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Create database indexes for better performance
    await createIndexes();

    // Initialize Redis (optional - for rate limiting, caching)
    await getRedis();

    // Payment reminder emails (7, 3, 1 day before expiry) — daily at 9:00 AM
    startPaymentReminderCron();

    // Start the server
    const server = app.listen(config.server.port, () => {
      if (config.server.isDevelopment || process.env.LOG_CONFIG === 'true') {
        console.log(`[ScanBit] Server on port ${config.server.port}`);
      }
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      server.close(async () => {
        try {
          const { closeDatabase } = await import('./config/database.js');
          await closeRedis();
          await closeDatabase();
          process.exit(0);
        } catch (error) {
          process.exit(1);
        }
      });
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    process.on('unhandledRejection', () => {
      if (config.server.isProduction) {
        gracefulShutdown();
      }
    });

    process.on('uncaughtException', () => {
      if (config.server.isProduction) {
        gracefulShutdown();
      }
    });
    
  } catch (error) {
    console.error('[ScanBit] Server failed to start:', error?.message || error);
    process.exit(1);
  }
};

// Start the server
startServer();
