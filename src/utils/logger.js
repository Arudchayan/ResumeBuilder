/**
 * Logger utility that only logs in development mode
 * In production, errors can be sent to error tracking services like Sentry
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Log informational messages (development only)
   */
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log informational messages (development only)
   */
  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  },

  /**
   * Log warning messages (development only)
   */
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
    // In production, optionally send to monitoring service
    // Example: if (!isDev) sendToMonitoring('warn', args);
  },

  /**
   * Log error messages (always logged, can be sent to error tracking in production)
   */
  error: (...args) => {
    if (isDev) {
      console.error(...args);
    } else {
      // In production, send to error tracking service
      // Example: Sentry.captureException(args[0]);
      console.error(...args); // Keep for now, can be removed when error tracking is set up
    }
  },

  /**
   * Log debug messages (development only)
   */
  debug: (...args) => {
    if (isDev) {
      console.debug(...args);
    }
  }
};
