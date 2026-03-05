export { AppPluginProvider, type AppPluginProviderProps } from './provider.js';

export {
  useAppContext,
  useAppPlugin,
  useAppPluginMeta,
  useAppPlugins,
  useAppSlot,
  useEnabledAppPlugins,
} from './hooks.js';

// Re-export generic slot component – it works with AppSlot names too.
export { PluginSlot, type PluginSlotProps } from '@react-pkl/core/react';
