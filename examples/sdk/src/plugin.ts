import {
  PluginClient,
  PluginManager,
  type PluginClientOptions,
  type PluginLoader,
  type PluginModule,
} from '@react-pkl/core';
import type { ComponentType } from 'react';
import type { AppContext } from './app-context.js';
import type { AppSlot } from './slots.js';

// ---------------------------------------------------------------------------
// Typed plugin shape
// ---------------------------------------------------------------------------

/**
 * An AppPlugin narrows the generic PluginModule to the concrete AppContext
 * and restricts component keys to the known AppSlot union.
 */
export interface AppPlugin extends PluginModule<AppContext> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components?: Partial<Record<AppSlot, ComponentType<any>>>;
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
 *   components: { toolbar: MyToolbarButton },
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
