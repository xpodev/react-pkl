/**
 * ResourceTracker - Generic resource management for plugins
 * 
 * Allows SDK developers to track any type of resource (routes, event listeners, etc.)
 * and automatically clean them up when plugins are disabled.
 */

export type CleanupFunction = () => void;

export class ResourceTracker {
  // Map of pluginId -> array of cleanup functions
  private readonly _cleanups = new Map<string, CleanupFunction[]>();

  /**
   * Register a cleanup function for a specific plugin.
   * This will be called when the plugin is disabled or removed.
   */
  register(pluginId: string, cleanup: CleanupFunction): void {
    if (!this._cleanups.has(pluginId)) {
      this._cleanups.set(pluginId, []);
    }
    this._cleanups.get(pluginId)!.push(cleanup);
  }

  /**
   * Clean up all resources for a plugin.
   * Called automatically by the PluginManager when a plugin is disabled/removed.
   */
  cleanup(pluginId: string): void {
    const cleanups = this._cleanups.get(pluginId);
    if (!cleanups) return;

    // Run all cleanup functions
    for (const cleanup of cleanups) {
      try {
        cleanup();
      } catch (error) {
        console.error(`Error cleaning up resources for plugin ${pluginId}:`, error);
      }
    }

    // Clear the cleanup list
    this._cleanups.delete(pluginId);
  }

  /**
   * Check if a plugin has any registered resources.
   */
  has(pluginId: string): boolean {
    return this._cleanups.has(pluginId);
  }
}
