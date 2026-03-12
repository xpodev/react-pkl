import type { RouterService, PluginRoute } from 'example-sdk';

/**
 * Create a router service that wraps React Router navigation
 */
export function createRouterService(
  navigate: (path: string) => void,
  getCurrentPath: () => string
): RouterService {
  const routes = new Map<string, PluginRoute>();

  return {
    navigate(path: string): void {
      navigate(path);
    },

    currentPath(): string {
      return getCurrentPath();
    },

    registerRoute(route: PluginRoute): void {
      routes.set(route.path, route);
    },

    unregisterRoute(path: string): void {
      routes.delete(path);
    },

    getRoutes(): Map<string, PluginRoute> {
      return new Map(routes);
    },
  };
}
