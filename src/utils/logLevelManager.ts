
/**
 * Production Log Level Management System
 * Provides centralized logging control with environment-based filtering
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: number;
  data?: any;
}

class LogLevelManager {
  private currentLevel: LogLevel;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;
  private throttleMap = new Map<string, number>();
  private throttleWindow = 1000; // 1 second

  constructor() {
    // Set log level based on environment
    this.currentLevel = this.getEnvironmentLogLevel();
  }

  private getEnvironmentLogLevel(): LogLevel {
    if (process.env.NODE_ENV === 'production') {
      return 'error'; // Only show errors in production
    }
    if (process.env.NODE_ENV === 'test') {
      return 'silent'; // Silent during tests
    }
    return 'debug'; // Show all logs in development
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'silent'];
    const currentIndex = levels.indexOf(this.currentLevel);
    const messageIndex = levels.indexOf(level);
    
    return messageIndex >= currentIndex && this.currentLevel !== 'silent';
  }

  private throttle(key: string): boolean {
    const now = Date.now();
    const lastLog = this.throttleMap.get(key) || 0;
    
    if (now - lastLog < this.throttleWindow) {
      return false; // Throttled
    }
    
    this.throttleMap.set(key, now);
    return true;
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  public log(level: LogLevel, message: string, context?: string, data?: any): void {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: Date.now(),
      data
    };

    this.addToBuffer(entry);

    if (!this.shouldLog(level)) {
      return;
    }

    // Create throttle key for repetitive messages
    const throttleKey = `${context || 'general'}-${message.substring(0, 50)}`;
    
    // Apply throttling to debug and info messages
    if ((level === 'debug' || level === 'info') && !this.throttle(throttleKey)) {
      return;
    }

    // Output to console with appropriate method
    const logMethod = console[level] || console.log;
    const prefix = context ? `[${context.toUpperCase()}]` : '';
    
    if (data) {
      logMethod(`${prefix} ${message}`, data);
    } else {
      logMethod(`${prefix} ${message}`);
    }
  }

  public debug(message: string, context?: string, data?: any): void {
    this.log('debug', message, context, data);
  }

  public info(message: string, context?: string, data?: any): void {
    this.log('info', message, context, data);
  }

  public warn(message: string, context?: string, data?: any): void {
    this.log('warn', message, context, data);
  }

  public error(message: string, context?: string, data?: any): void {
    this.log('error', message, context, data);
  }

  public setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  public getLevel(): LogLevel {
    return this.currentLevel;
  }

  public getRecentLogs(count: number = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  public clearBuffer(): void {
    this.logBuffer = [];
  }

  public clearThrottleCache(): void {
    this.throttleMap.clear();
  }
}

export const logManager = new LogLevelManager();

// Convenience functions for consistent logging across the app
export const logger = {
  debug: (message: string, context?: string, data?: any) => logManager.debug(message, context, data),
  info: (message: string, context?: string, data?: any) => logManager.info(message, context, data),
  warn: (message: string, context?: string, data?: any) => logManager.warn(message, context, data),
  error: (message: string, context?: string, data?: any) => logManager.error(message, context, data),
  setLevel: (level: LogLevel) => logManager.setLevel(level),
  getLevel: () => logManager.getLevel(),
  getRecentLogs: (count?: number) => logManager.getRecentLogs(count),
  clearBuffer: () => logManager.clearBuffer()
};
