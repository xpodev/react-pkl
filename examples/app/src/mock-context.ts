import type { AppContext, PluginRoute } from 'example-sdk';
import type { PluginHost } from '@react-pkl/core';

let _notifId = 0;

/**
 * A minimal in-memory AppContext suitable for development and demos.
 * In a real app each service would be backed by proper state management.
 */
export function createMockAppContext(
  pluginHost: PluginHost<AppContext>,
  onNotify?: (id: string, message: string, type: string) => void,
  onNavigate?: (path: string) => void,
  routes?: Map<string, PluginRoute>,
  onRouteChange?: () => void
): AppContext {
  const context: AppContext = {
    pluginHost,
    
    notifications: {
      show(message, type = 'info') {
        const id = `notif-${++_notifId}`;
        console.info(`[notification:${type}] ${message}`);
        onNotify?.(id, message, type);
        return id;
      },
      dismiss(id) {
        console.info(`[notification] dismissed ${id}`);
      },
    },

    router: {
      navigate(path) {
        console.info(`[router] navigate → ${path}`);
        onNavigate?.(path);
      },
      currentPath() {
        return window.location.pathname;
      },
      registerRoute(route) {
        const pluginId = context._currentPluginId;
        routes?.set(route.path, route);
        
        // Auto-register cleanup if we have resource tracking
        if (pluginId && context._resources) {
          context._resources.register(pluginId, () => {
            routes?.delete(route.path);
            onRouteChange?.();
          });
        }
        
        onRouteChange?.();
      },
      unregisterRoute(path) {
        console.info(`[router] unregistering route: ${path}`);
        routes?.delete(path);
        onRouteChange?.();
      },
    },

    user: {
      id: 'user-1',
      name: 'Alice Dev',
      email: 'alice@example.com',
      role: 'admin',
    },

    logger: {
      log: (...args) => console.log('[plugin]', ...args),
      warn: (...args) => console.warn('[plugin]', ...args),
      error: (...args) => console.error('[plugin]', ...args),
    },
  };

  return context;
}
