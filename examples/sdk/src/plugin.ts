import {
  PluginClient,
  PluginHost,
  PluginManager,
  type PluginClientOptions,
  type PluginInfrastructure,
  type PluginLoader,
  type PluginModule,
} from '@pkl.js/react';

// ---------------------------------------------------------------------------
// Typed plugin shape
// ---------------------------------------------------------------------------

/**
 * An AppPlugin uses PluginInfrastructure for lifecycle methods.
 * App services are accessed via hooks in the entrypoint, not via context.
 */
export interface AppPlugin extends PluginModule<PluginInfrastructure> {
  /**
   * Optional entrypoint function that returns React elements to be rendered.
   * Used for initializing plugin UI when the plugin is enabled.
   * 
   * Use hooks like useNotifications(), useRouter(), useUser() to access app services.
   */
  entrypoint?: () => React.ReactNode;
  
  /**
   * Optional layout function for theme plugins.
   * Receives a map of slot component functions and can override them.
   */
  layout?: (slots: Map<Function, Function>) => void;
}

export type AppPluginLoader = PluginLoader<PluginInfrastructure>;

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
 *   activate(infra) {
 *     // Infrastructure only - resource tracking, plugin host access
 *     infra._resources.track(() => console.log('cleanup'));
 *   },
 *   entrypoint: () => {
 *     // App services via hooks
 *     const notifications = useNotifications();
 *     const user = useUser();
 *     return <MyPluginUI />;
 *   },
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
 * Create a PluginManager pre-typed to PluginInfrastructure.
 */
export function createAppManager(context?: PluginInfrastructure): PluginManager<PluginInfrastructure> {
  return new PluginManager<PluginInfrastructure>(context);
}

/**
 * Create a PluginClient pre-typed to PluginInfrastructure.
 */
export function createAppClient(
  options: PluginClientOptions<PluginInfrastructure>
): PluginClient<PluginInfrastructure> {
  return new PluginClient<PluginInfrastructure>(options);
}

/**
 * Create a PluginHost pre-typed to PluginInfrastructure.
 * The host manages the plugin registry and theme plugins.
 * 
 * Note: The host no longer needs app-specific context.
 * App services are provided via separate React contexts.
 */
export function createAppHost(): PluginHost<PluginInfrastructure> {
  return new PluginHost<PluginInfrastructure>();
}
