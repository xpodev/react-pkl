import { createTypedHooks } from '@pkl.js/react/react';
import type { PluginInfrastructure } from '@pkl.js/react';

/**
 * Typed hooks for plugin infrastructure - automatically generated via createTypedHooks.
 * 
 * Note: These hooks give access to plugin infrastructure (host, resources).
 * For app services (notifications, router, user, logger), use the service-specific hooks:
 * - useNotifications()
 * - useRouter()
 * - useUser()
 * - useLogger()
 */
export const {
  usePlugins: useAppPlugins,
  useEnabledPlugins: useEnabledAppPlugins,
  usePlugin: useAppPlugin,
  usePluginMeta: useAppPluginMeta,
  usePluginHost: useAppPluginHost,
  useCurrentPlugin: useCurrentAppPlugin,
} = createTypedHooks<PluginInfrastructure>();
