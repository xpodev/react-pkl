import type React from 'react';

// ---------------------------------------------------------------------------
// App Services – each exposed via separate React contexts
// ---------------------------------------------------------------------------

/**
 * Notification service for showing toast messages
 */
export interface NotificationService {
  /**
   * Show a notification. Returns an id that can be used to dismiss it.
   */
  show(message: string, type?: 'info' | 'success' | 'warning' | 'error'): string;
  /** Dismiss a notification by id. */
  dismiss(id: string): void;
}

/**
 * Route definition for plugin-contributed pages
 */
export interface PluginRoute {
  /** Route path (e.g., '/settings', '/my-plugin/dashboard') */
  path: string;
  /** React component to render for this route */
  component: React.ComponentType;
  /** Optional display name for navigation menus */
  label?: string;
}

/**
 * Router service for SPA navigation
 */
export interface RouterService {
  /** Navigate to a path. */
  navigate(path: string): void;
  /** Return the current pathname. */
  currentPath(): string;
  /**
   * Register a new route that plugins can navigate to.
   * The route is automatically associated with the calling plugin
   * and will be cleaned up when the plugin is disabled/removed.
   */
  registerRoute(route: PluginRoute): void;
  /**
   * Unregister a route by path (rarely needed - auto-cleanup handles this).
   */
  unregisterRoute(path: string): void;
  /**
   * Get all registered plugin routes.
   */
  getRoutes(): Map<string, PluginRoute>;
}

/**
 * User information
 */
export interface UserInfo {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
}

/**
 * Logger service for console output
 */
export interface LoggerService {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}
