import type { ComponentType, ReactNode } from 'react';

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
   * Layout function for theme plugins.
   * Receives a Map where plugins can register layout slot overrides.
   * The key is the default layout slot component, value is the replacement component.
   */
  layout?(slots: Map<Function, Function>): void;
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
