import { config } from '../config/environment.js';

/**
 * Set the auth JWT in an httpOnly cookie for cross-site requests
 * (e.g. https://www.scanbit.in -> https://server.scanbit.in).
 * Requires: secure: true, sameSite: 'None', and COOKIE_DOMAIN=.scanbit.in in production.
 */
export function setAuthCookie(res, token) {
  const opts = {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    maxAge: config.cookie.maxAge,
    path: '/',
  };
  if (config.cookie.domain) opts.domain = config.cookie.domain;
  res.cookie(config.cookie.name, token, opts);
}

/**
 * Clear the auth cookie (e.g. on logout).
 */
export function clearAuthCookie(res) {
  const opts = {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: '/',
    maxAge: 0,
  };
  if (config.cookie.domain) opts.domain = config.cookie.domain;
  res.clearCookie(config.cookie.name, opts);
}
