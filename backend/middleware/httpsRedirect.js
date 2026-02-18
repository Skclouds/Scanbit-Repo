/**
 * HTTPS Redirect Middleware
 * In production, redirect HTTP requests to HTTPS.
 * Relies on X-Forwarded-Proto when behind a reverse proxy.
 */
import { config } from '../config/environment.js';

export const httpsRedirect = (req, res, next) => {
  if (!config.server.isProduction) {
    return next();
  }

  // Trust proxy: X-Forwarded-Proto is set by reverse proxy
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  if (proto === 'https') {
    return next();
  }

  // Redirect to HTTPS
  const host = req.headers['x-forwarded-host'] || req.get('host') || req.hostname;
  const url = `https://${host}${req.originalUrl}`;
  return res.redirect(301, url);
};

export default httpsRedirect;
