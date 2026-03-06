import type { PluginModule } from './types.js';
import { PluginManager } from './plugin-manager.js';
import type { PluginRegistry } from './plugin-registry.js';

/**
 * PluginHost
 *
 * Central controller for plugin lifecycle, roles, and layout management.
 * Handles theme plugins, resource cleanup, and delegates to PluginManager for lifecycle operations.
 */
export class PluginHost<TContext = unknown> {
  private readonly _manager: PluginManager<TContext>;
  private _themePlugin: PluginModule<TContext> | null = null;
  private _layoutSlots = new Map<Function, Function>();
  private _themeCleanup: (() => void) | null = null;
  private _resources = new Map<PluginModule<TContext>, Array<() => void>>();
  private _currentPlugin: PluginModule<TContext> | null = null;
  private _changeListeners = new Set<() => void>();

  constructor(context?: TContext) {
    this._manager = new PluginManager<TContext>(context);
  }

  // -------------------------------------------------------------------------
  // Theme Plugin Management
  // -------------------------------------------------------------------------

  /**
   * Set the active theme plugin.
   * Only one theme plugin can be active at a time.
   * 
   * @param plugin - The plugin module to set as theme, or null to reset to default
   * @throws Error if plugin doesn't have onThemeEnable method
   */
  setThemePlugin(plugin: PluginModule<TContext> | null): void {
    if (plugin && !plugin.onThemeEnable) {
      throw new Error(
        `Plugin "${plugin.meta.name}" cannot be set as theme plugin: missing onThemeEnable method`
      );
    }

    // Disable previous theme
    if (this._themePlugin) {
      // Call theme cleanup if exists
      if (this._themeCleanup) {
        this._themeCleanup();
        this._themeCleanup = null;
      }
      // Call onThemeDisable if exists
      this._themePlugin.onThemeDisable?.();
    }

    // Clear previous theme state
    this._layoutSlots.clear();
    this._themePlugin = null;

    // Enable new theme
    if (plugin?.onThemeEnable) {
      this._themePlugin = plugin;
      const cleanup = plugin.onThemeEnable(this._layoutSlots);
      if (typeof cleanup === 'function') {
        this._themeCleanup = cleanup;
      }
    }

    // Notify listeners to trigger re-render
    this._notifyChange();
  }

  /**
   * Get the currently active theme plugin.
   */
  getThemePlugin(): PluginModule<TContext> | null {
    return this._themePlugin;
  }

  /**
   * Get the layout override for a slot component.
   * Returns null if no override is set.
   */
  getLayoutSlotOverride(defaultComponent: Function): Function | null {
    return this._layoutSlots.get(defaultComponent) || null;
  }

  // -------------------------------------------------------------------------
  // Current Plugin Tracking
  // -------------------------------------------------------------------------

  /**
   * Set the currently executing plugin.
   * Used internally for resource tracking.
   * 
   * @internal
   */
  setCurrentPlugin(plugin: PluginModule<TContext> | null): void {
    this._currentPlugin = plugin;
  }

  /**
   * Get the currently executing plugin.
   */
  getCurrentPlugin(): PluginModule<TContext> | null {
    return this._currentPlugin;
  }

  // -------------------------------------------------------------------------
  // Resource Management
  // -------------------------------------------------------------------------

  /**
   * Register a cleanup function for a plugin.
   * Will be called when the plugin is disabled or removed.
   */
  registerResource(plugin: PluginModule<TContext>, cleanup: () => void): void {
    if (!this._resources.has(plugin)) {
      this._resources.set(plugin, []);
    }
    this._resources.get(plugin)!.push(cleanup);
  }

  /**
   * Clean up all resources for a plugin.
   * Called automatically when a plugin is disabled or removed.
   */
  cleanupResources(plugin: PluginModule<TContext>): void {
    const cleanups = this._resources.get(plugin);
    if (!cleanups) return;

    // Run all cleanup functions
    for (const cleanup of cleanups) {
      try {
        cleanup();
      } catch (error) {
        console.error(
          `Error cleaning up resources for plugin ${plugin.meta.id}:`,
          error
        );
      }
    }

    // Clear the cleanup list
    this._resources.delete(plugin);
  }

  /**
   * Check if a plugin has any registered resources.
   */
  hasResources(plugin: PluginModule<TContext>): boolean {
    return this._resources.has(plugin);
  }

  // -------------------------------------------------------------------------
  // Change Notifications
  // -------------------------------------------------------------------------

  /**
   * Subscribe to host changes (theme changes, etc.).
   * Returns an unsubscribe function.
   */
  subscribe(listener: () => void): () => void {
    this._changeListeners.add(listener);
    return () => this._changeListeners.delete(listener);
  }

  private _notifyChange(): void {
    for (const listener of this._changeListeners) {
      listener();
    }
  }

  // -------------------------------------------------------------------------
  // Registry Access
  // -------------------------------------------------------------------------

  /**
   * Get the plugin registry.
   */
  getRegistry(): PluginRegistry<TContext> {
    return this._manager.registry;
  }

  /**
   * Get the plugin registry.
   */
  get registry(): PluginRegistry<TContext> {
    return this._manager.registry;
  }

  /**
   * Get the plugin manager for direct lifecycle control.
   */
  getManager(): PluginManager<TContext> {
    return this._manager;
  }

  /**
   * Get the plugin manager for direct lifecycle control.
   */
  get manager(): PluginManager<TContext> {
    return this._manager;
  }
}
