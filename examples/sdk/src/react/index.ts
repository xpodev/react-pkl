export { AppPluginProvider, type AppPluginProviderProps } from './provider.js';

export {
  useAppContext,
  useAppPlugin,
  useAppPluginMeta,
  useAppPlugins,
  useEnabledAppPlugins,
  useAppPluginHost,
  useCurrentAppPlugin,
} from './hooks.js';

// Re-export PluginEntrypoints component for rendering plugin entrypoints
export { PluginEntrypoints } from '@react-pkl/core/react';
