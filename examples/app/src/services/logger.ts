import type { LoggerService } from 'example-sdk';

/**
 * Create a logger service for debugging
 */
export function createLoggerService(): LoggerService {
  return {
    log(...args: any[]): void {
      console.log('[App]', ...args);
    },

    warn(...args: any[]): void {
      console.warn('[App]', ...args);
    },

    error(...args: any[]): void {
      console.error('[App]', ...args);
    },
  };
}
