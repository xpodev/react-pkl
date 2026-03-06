import type { ComponentType, ReactNode } from 'react';

// Forward declarations to avoid circular dependencies
export interface PluginHost<TContext = unknown> {
  setThemePlugin(plugin: PluginModule<TContext> | null): void;
  getThemePlugin(): PluginModule<TContext> | null;
  getLayoutOverride(component: Function): Function | null;
}

export interface ResourceTracker {
  track(cleanup: () => void): void;
  cleanup(): void;
}

// ---------------------------------------------------------------------------
// Plugin infrastructure context – minimal context for plugin lifecycle
// ---------------------------------------------------------------------------

/**
 * Minimal plugin infrastructure context.
 * This is the core functionality that React PKL provides to plugins.
 * 
 * Apps typically don't use this directly – instead they compose their own
 * services and expose them via separate React contexts/hooks.
 */
export interface PluginInfrastructure {
  /**
   * The plugin host managing this plugin.
   * Used for theme management and accessing other plugin functionality.
   */
  readonly host: PluginHost<any>;
  
  /**
   * Resource tracker for automatic cleanup.
   * Plugins can register cleanup functions that run when they're disabled.
   * @internal
   */
  readonly _resources: ResourceTracker;
  
  /**
   * Current plugin ID for resource tracking.
   * @internal
   */
  readonly _pluginId: string;
}

// ---------------------------------------------------------------------------
// Plugin descriptor – static metadata about a plugin
// ---------------------------------------------------------------------------

export interface PluginMeta {
  /** Unique identifier for the plugin */
  readonly id: string;
  /** Human-readable name */
  readonly name: string;
  /** Semver version string */
  readonly version: string;
  /** Optional description */
  readonly description?: string;
}

// ---------------------------------------------------------------------------
// Plugin module – the runtime export of a plugin bundle
// ---------------------------------------------------------------------------

/**
 * A plugin module is the object that a plugin bundle's entry point must export.
 * It is generic over TContext – the host application context type.
 */
export interface PluginModule<TContext = unknown> {
  /** Plugin metadata */
  readonly meta: PluginMeta;

  /**
   * Called by the host when the plugin is activated.
   * Receives the host context so the plugin can interact with the application.
   */
  activate?(context: TContext): void | Promise<void>;

  /**
   * Called by the host when the plugin is deactivated.
   */
  deactivate?(): void | Promise<void>;

  /**
   * React entry point for the plugin.
   * Executes in React context and can render slot items.
   * Should return null or React elements that register with slots.
   */
  entrypoint?(): ReactNode;

  /**
   * Called when this plugin is set as the active theme.
   * Receives a Map where the plugin can register layout slot overrides.
   * The key is the default layout slot component, value is the replacement component.
   * 
   * This method can also be used to apply global theme-specific CSS, inject styles, etc.
   */
  onThemeEnable?(slots: Map<Function, Function>): void | (() => void);

  /**
   * Called when this plugin is no longer the active theme.
   * Use this to clean up any theme-specific CSS, remove injected styles, etc.
   * 
   * If onThemeEnable returned a cleanup function, it will be called automatically.
   */
  onThemeDisable?(): void;
}

// ---------------------------------------------------------------------------
// Plugin entry – internal bookkeeping
// ---------------------------------------------------------------------------

export type PluginStatus = 'enabled' | 'disabled';

export interface PluginEntry<TContext = unknown> {
  readonly module: PluginModule<TContext>;
  status: PluginStatus;
}

// ---------------------------------------------------------------------------
// Plugin loader – a factory that returns a PluginModule
// ---------------------------------------------------------------------------

/**
 * A plain object can be used directly as a plugin, or a factory function can
 * be used when the module needs to be constructed lazily.
 */
export type PluginLoader<TContext = unknown> =
  | PluginModule<TContext>
  | (() => PluginModule<TContext> | Promise<PluginModule<TContext>>);

// ---------------------------------------------------------------------------
// Plugin client – describes the shape of a remote plugin manifest item
// ---------------------------------------------------------------------------

export interface RemotePluginDescriptor {
  /** Plugin metadata */
  readonly meta: PluginMeta;
  /** URL to the plugin's entry-point JS bundle */
  readonly url: string;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export type PluginEvent =
  | { type: 'added'; pluginId: string }
  | { type: 'removed'; pluginId: string }
  | { type: 'enabled'; pluginId: string }
  | { type: 'disabled'; pluginId: string };

export type PluginEventListener = (event: PluginEvent) => void;

// ---------------------------------------------------------------------------
// Plugin utility functions
// ---------------------------------------------------------------------------

/**
 * Check if a plugin is "static" (doesn't have lifecycle methods).
 * Static plugins are always available and cannot be enabled/disabled.
 * They're useful for plugins that only provide theme or UI extensions
 * without any runtime lifecycle management.
 */
export function isStaticPlugin<TContext = unknown>(
  plugin: PluginModule<TContext>
): boolean {
  return !plugin.activate && !plugin.deactivate;
}

/**
 * Check if a plugin is a theme plugin (has theme lifecycle methods).
 * Theme plugins can be set as the active theme using PluginHost.setThemePlugin().
 */
export function isThemePlugin<TContext = unknown>(
  plugin: PluginModule<TContext>
): boolean {
  return typeof plugin.onThemeEnable === 'function';
}
