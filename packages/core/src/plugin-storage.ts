/**
 * PluginProvider - Source of truth for what plugins should be loaded
 * 
 * The provider tells the application which plugins to load and their initial states.
 * Implementations can use localStorage, remote APIs, configuration files, etc.
 */

export interface PluginDescriptor {
  /** Unique plugin identifier */
  id: string;
  /** Module loader (can be dynamic import or direct reference) */
  loader: () => Promise<any> | any;
  /** Initial enabled/disabled state */
  enabled: boolean;
}

export interface PluginProvider {
  /**
   * Get the list of plugins that should be loaded.
   * Called once at application startup.
   */
  getPlugins(): Promise<PluginDescriptor[]> | PluginDescriptor[];

  /**
   * Optional: Save plugin state when it changes.
   * If not implemented, state changes won't persist across reloads.
   */
  savePluginState?(pluginId: string, enabled: boolean): Promise<void> | void;
}
