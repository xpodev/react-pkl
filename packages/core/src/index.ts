export type {
  PluginEntry,
  PluginEvent,
  PluginEventListener,
  PluginLoader,
  PluginMeta,
  PluginModule,
  PluginStatus,
  RemotePluginDescriptor,
  PluginInfrastructure,
} from './types.js';

export { isStaticPlugin, isThemePlugin } from './types.js';

export { PluginRegistry } from './plugin-registry.js';
export { PluginManager } from './plugin-manager.js';
export { PluginClient } from './plugin-client.js';
export type { PluginClientOptions } from './plugin-client.js';
export { PluginHost } from './plugin-host.js';
export { ResourceTracker } from './resource-tracker.js';
export type { CleanupFunction } from './resource-tracker.js';
export type { PluginProvider, PluginDescriptor } from './plugin-storage.js';
