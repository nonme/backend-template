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
 * Log error with proper message extraction
 */
export function logError(
  error: unknown,
  context?: string,
  metadata?: Record<string, unknown>,
): void {
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
}

/**
 * Log info with optional metadata
 */
export function logInfo(
  message: string,
  metadata?: Record<string, unknown>,
): void {
  logger.info({ ...metadata }, message);
}

/**
 * Log warning with optional metadata
 */
export function logWarning(
  message: string,
  metadata?: Record<string, unknown>,
): void {
  logger.warn({ ...metadata }, message);
}

/**
 * Log debug with optional metadata (only in development)
 */
export function logDebug(
  message: string,
  metadata?: Record<string, unknown>,
): void {
  logger.debug({ ...metadata }, message);
}
