import type React from 'react';
import type { ResourceTracker } from '@react-pkl/core';

// ---------------------------------------------------------------------------
// Services available to plugins via the host context
// ---------------------------------------------------------------------------

export interface NotificationService {
  /**
   * Show a notification. Returns an id that can be used to dismiss it.
   */
  show(message: string, type?: 'info' | 'success' | 'warning' | 'error'): string;
  /** Dismiss a notification by id. */
  dismiss(id: string): void;
}

export interface PluginRoute {
  /** Route path (e.g., '/settings', '/my-plugin/dashboard') */
  path: string;
  /** React component to render for this route */
  component: React.ComponentType;
  /** Optional display name for navigation menus */
  label?: string;
}

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

export interface UserInfo {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
}

export interface LoggerService {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

// ---------------------------------------------------------------------------
// AppContext – the host context passed to every plugin on activation
// ---------------------------------------------------------------------------

export interface AppContext {
  /** Show and dismiss notifications. */
  notifications: NotificationService;
  /** SPA-style navigation and route registration. */
  router: RouterService;
  /** Currently authenticated user, or null when anonymous. */
  user: UserInfo | null;
  /** Namespaced logger. */
  logger: LoggerService;
  /**
   * Plugin host for theme management and layout control.
   * Theme plugins can use this to register themselves:
   * ```ts
   * activate(context) {
   *   context.pluginHost.setThemePlugin(this);
   * }
   * ```
   */
  pluginHost: import('@react-pkl/core').PluginHost<AppContext>;
  /**
   * Resource tracker for automatic cleanup.
   * Plugins can register cleanup functions that run when they're disabled.
   * 
   * @internal - Typically set by the plugin manager
   */
  _resources?: ResourceTracker;
  /**
   * Current plugin ID for resource tracking.
   * 
   * @internal - Set by the plugin manager during activation
   */
  _currentPluginId?: string;
}
