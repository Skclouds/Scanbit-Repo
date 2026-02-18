/**
 * Production-safe logging with Pino
 * - No console.log in production
 * - Separate error logs
 * - Structured logging for suspicious activity
 */
import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'warn' : 'warn');

const logger = pino({
  level: logLevel,
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }),
});

export const log = {
  info: (msg, meta = {}) => logger.info(meta, msg),
  warn: (msg, meta = {}) => logger.warn(meta, msg),
  error: (msg, meta = {}) => logger.error(meta, msg),
  debug: (msg, meta = {}) => logger.debug(meta, msg),
};

/** Log suspicious activity (rate limit hits, auth failures, invalid webhooks) */
export const logSuspicious = (event, meta = {}) => {
  logger.warn({ ...meta, suspicious: true }, `[SECURITY] ${event}`);
};

export default logger;
