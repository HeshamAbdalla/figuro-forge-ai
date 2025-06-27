
/**
 * Production-Safe Logging System
 * Replaces console logs with production-appropriate alternatives
 */

export interface LogLevel {
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
}

export const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
} as const;

class ProductionLogger {
  private isDevelopment: boolean;
  private isProduction: boolean;
  private logLevel: number;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logLevel = this.isProduction ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG;
  }

  private shouldLog(level: number): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: string, message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level}] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      this.formatMessage('DEBUG', message, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      this.formatMessage('INFO', message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      this.formatMessage('WARN', message, ...args);
    }
    // In production, we might want to send warnings to a monitoring service
    if (this.isProduction) {
      // Could integrate with error reporting service here
    }
  }

  error(message: string, error?: any, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      this.formatMessage('ERROR', message, error, ...args);
    }
    // In production, always log errors to monitoring service
    if (this.isProduction && error) {
      // Could integrate with error reporting service here
      // For now, we'll use a minimal console.error for critical errors only
      console.error(`Production Error: ${message}`, error);
    }
  }

  // Performance logging
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // Group logging for development
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Convenience methods
export const logDebug = (message: string, ...args: any[]) => logger.debug(message, ...args);
export const logInfo = (message: string, ...args: any[]) => logger.info(message, ...args);
export const logWarn = (message: string, ...args: any[]) => logger.warn(message, ...args);
export const logError = (message: string, error?: any, ...args: any[]) => logger.error(message, error, ...args);
