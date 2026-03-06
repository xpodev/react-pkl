import {
  PluginClient,
  PluginHost,
  PluginManager,
  type PluginClientOptions,
  type PluginLoader,
  type PluginModule,
} from '@react-pkl/core';
import type { AppContext } from './app-context.js';
import type { AppLayout } from './slots.js';

// ---------------------------------------------------------------------------
// Typed plugin shape
// ---------------------------------------------------------------------------

/**
 * An AppPlugin narrows the generic PluginModule to the concrete AppContext
 * and AppLayout types.
 */
export interface AppPlugin extends PluginModule<AppContext> {
  /**
   * Optional entrypoint function that returns React elements to be rendered.
   * Used for initializing plugin UI when the plugin is enabled.
   */
  entrypoint?: () => React.ReactNode;
  
  /**
   * Optional layout function for theme plugins.
   * Receives a map of slot component functions and can override them.
   */
  layout?: (slots: Map<Function, Function>) => void;
}

export type AppPluginLoader = PluginLoader<AppContext>;

// ---------------------------------------------------------------------------
// definePlugin – identity helper that infers the generic correctly
// ---------------------------------------------------------------------------

/**
 * Type-safe factory for creating app plugins.
 *
 * @example
 * ```ts
 * export default definePlugin({
 *   meta: { id: 'my-plugin', name: 'My Plugin', version: '1.0.0' },
 *   activate(context) {
 *     context.logger.log('activated');
 *   },
 *   entrypoint: () => <MyPluginUI />,
 * });
 * ```
 */
export function definePlugin(plugin: AppPlugin): AppPlugin {
  return plugin;
}

// ---------------------------------------------------------------------------
// Convenience factories
// ---------------------------------------------------------------------------

/**
 * Create a PluginManager pre-typed to AppContext.
 */
export function createAppManager(context?: AppContext): PluginManager<AppContext> {
  return new PluginManager<AppContext>(context);
}

/**
 * Create a PluginClient pre-typed to AppContext.
 */
export function createAppClient(
  options: PluginClientOptions<AppContext>
): PluginClient<AppContext> {
  return new PluginClient<AppContext>(options);
}

/**
 * Create a PluginHost pre-typed to AppContext and AppLayout.
 * The host manages the plugin registry and theme plugins.
 */
export function createAppHost(context?: AppContext): PluginHost<AppContext> {
  return new PluginHost<AppContext>(context);
}
