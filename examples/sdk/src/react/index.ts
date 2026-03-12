export { AppPluginProvider, type AppPluginProviderProps } from './provider.js';

export {
  useAppPlugin,
  useAppPluginMeta,
  useAppPlugins,
  useEnabledAppPlugins,
  useAppPluginHost,
  useCurrentAppPlugin,
} from './hooks.js';

// Export service contexts and hooks
export {
  NotificationsProvider,
  useNotifications,
  RouterProvider,
  useRouter,
  UserProvider,
  useUser,
  LoggerProvider,
  useLogger,
} from './services.js';

// Re-export PluginEntrypoints component for rendering plugin entrypoints
export { PluginEntrypoints } from '@pkl.js/react/react';
