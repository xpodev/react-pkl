import {
  useEnabledPlugins,
  usePlugin,
  usePluginMeta,
  usePlugins,
  usePluginHost,
  useCurrentPlugin,
} from '@react-pkl/core/react';
import type { PluginEntry, PluginMeta, PluginHost } from '@react-pkl/core';
import type { AppContext } from '../app-context.js';
import type { AppPlugin } from '../plugin.js';

export { useAppContext } from './app-context.js';

/**
 * Returns all registered plugin entries typed to `AppContext`.
 */
export function useAppPlugins(): ReadonlyArray<PluginEntry<AppContext>> {
  return usePlugins<AppContext>();
}

/**
 * Returns only enabled plugin entries typed to `AppContext`.
 */
export function useEnabledAppPlugins(): ReadonlyArray<PluginEntry<AppContext>> {
  return useEnabledPlugins<AppContext>();
}

/**
 * Returns a single plugin entry by id, typed to `AppContext`.
 */
export function useAppPlugin(id: string): PluginEntry<AppContext> | undefined {
  return usePlugin<AppContext>(id);
}

/**
 * Returns metadata for all registered plugins.
 */
export function useAppPluginMeta(): ReadonlyArray<PluginMeta> {
  return usePluginMeta();
}

/**
 * Returns the PluginHost instance.
 */
export function useAppPluginHost(): PluginHost<AppContext> {
  return usePluginHost<AppContext>();
}

/**
 * Returns the currently rendering plugin, or null if not in a plugin context.
 */
export function useCurrentAppPlugin(): import('../plugin.js').AppPlugin | null {
  return useCurrentPlugin<AppContext>();
}
