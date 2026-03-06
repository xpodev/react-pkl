import type { RouterService } from 'example-sdk';

/**
 * Create a router service that wraps React Router navigation
 */
export function createRouterService(
  navigate: (path: string) => void,
  getCurrentPath: () => string
): RouterService {
  return {
    navigate(path: string): void {
      navigate(path);
    },

    currentPath(): string {
      return getCurrentPath();
    },
  };
}
