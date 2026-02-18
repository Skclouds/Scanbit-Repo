/**
 * Helmet Security Configuration
 * Industry-standard HTTP security headers for Express.js
 * @see https://helmetjs.github.io/
 */

import helmet from 'helmet';

/**
 * Build CSP connect-src from allowed origins and external services.
 * In production, normalize http -> https.
 */
const getConnectSources = () => {
  const sources = ["'self'"];
  const isProd = process.env.NODE_ENV === 'production';
  const ensureHttps = (u) => (isProd && u.startsWith('http://') ? u.replace(/^http:\/\//i, 'https://') : u);

  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    frontendUrl.split(',').forEach((url) => {
      const trimmed = url.trim().replace(/\/$/, '');
      if (trimmed) sources.push(ensureHttps(trimmed));
    });
  }
  const apiUrl = process.env.PUBLIC_API_URL || process.env.API_URL;
  if (apiUrl) {
    apiUrl.split(',').forEach((url) => {
      const trimmed = url.trim().replace(/\/$/, '');
      if (trimmed) sources.push(ensureHttps(trimmed));
    });
  }
  sources.push(
    'https://api.razorpay.com',
    'https://checkout.razorpay.com',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://static.cloudflareinsights.com',
    'https://res.cloudinary.com',
    'https://*.cloudinary.com',
    'wss:',
    'blob:'
  );
  return sources;
};

/**
 * Build CSP frame-src for payment iframes (Razorpay)
 */
const getFrameSources = () => {
  return [
    "'self'",
    'https://api.razorpay.com',
    'https://checkout.razorpay.com',
    'https://razorpay.com',
  ];
};

/**
 * Build CSP img-src for images (Cloudinary, data URIs, blob)
 */
const getImgSources = () => {
  return [
    "'self'",
    'data:',
    'blob:',
    'https://res.cloudinary.com',
    'https://*.cloudinary.com',
  ];
};

/**
 * Build CSP script-src for external scripts (GA, Razorpay)
 */
const getScriptSources = () => {
  const sources = ["'self'"];
  if (process.env.NODE_ENV !== 'production') {
    sources.push("'unsafe-eval'"); // Vite HMR in development
  }
  sources.push(
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://checkout.razorpay.com',
    'https://api.razorpay.com',
    'https://static.cloudflareinsights.com'
  );
  return sources;
};

/**
 * Build CSP style-src (Tailwind/shadcn use inline styles)
 */
const getStyleSources = () => {
  return ["'self'", "'unsafe-inline'", 'https:'];
};

/**
 * Helmet configuration - industry-ready security headers
 */
export const helmetConfig = {
  // Content Security Policy
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: getScriptSources(),
      scriptSrcAttr: ["'none'"], // Disable inline event handlers (XSS)
      styleSrc: getStyleSources(),
      imgSrc: getImgSources(),
      connectSrc: getConnectSources(),
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: getFrameSources(),
      frameAncestors: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },

  // Strict Transport Security (HSTS) - production only
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // Prevent clickjacking
  frameguard: {
    action: 'sameorigin',
  },

  // Prevent MIME sniffing
  noSniff: true,

  // XSS filter (legacy browsers)
  xssFilter: true,

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // DNS prefetch control
  dnsPrefetchControl: {
    allow: false,
  },

  // Referrer policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // Cross-Origin policies
  crossOriginEmbedderPolicy: false, // Disable for Razorpay/Cloudinary embeds
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },

  // Permitted cross-domain policies (Adobe/Flash)
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },

  // IE-specific download options (X-Download-Options)
  ieNoOpen: true,
};

/**
 * Create Helmet middleware with environment-aware config
 */
export const createHelmet = () => {
  const config = { ...helmetConfig };

  // Disable HSTS in development (localhost + Safari issues)
  if (process.env.NODE_ENV !== 'production') {
    config.hsts = false;
  }

  // Relax CSP in development for hot reload
  if (process.env.NODE_ENV === 'development') {
    config.contentSecurityPolicy = {
      ...config.contentSecurityPolicy,
      directives: {
        ...config.contentSecurityPolicy.directives,
        upgradeInsecureRequests: null,
      },
    };
  }

  return helmet(config);
};

export default createHelmet;
