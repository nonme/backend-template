import pino from "pino";
import { validateConfig } from "../config/config";
import { getErrorMessage } from "./error.utils";

const config = validateConfig();
const isDevelopment = config.NODE_ENV === "development";

export const logger = pino({
  level: config.LOG_LEVEL,
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

/**
 * Enhanced logger with utility methods for common patterns
 */
export const enhancedLogger = {
  ...logger,

  /**
   * Log error with proper message extraction and stack trace
   */
  logError: (
    error: unknown,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void => {
    const errorMessage = getErrorMessage(error);
    const logData: Record<string, unknown> = {
      error: errorMessage,
      context,
      ...metadata,
    };

    if (error instanceof Error && error.stack) {
      logData.stack = error.stack;
    }

    const message = context ? `Error in ${context}` : "Error";
    logger.error(logData, message);
  },
};

// Export both the raw pino logger and enhanced version
// Use `logger` for standard logging: logger.info(), logger.error(), etc.
// Use `enhancedLogger.logError()` for enhanced error logging with stack traces
