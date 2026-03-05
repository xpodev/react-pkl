import {
  useEnabledPlugins,
  usePlugin,
  usePluginMeta,
  usePlugins,
  useSlotComponents,
} from '@react-pkl/core/react';
import type { PluginEntry, PluginMeta } from '@react-pkl/core';
import type { ComponentType } from 'react';
import type { AppContext } from '../app-context.js';
import type { AppSlot } from '../slots.js';

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
 * Returns all enabled components for a given `AppSlot`.
 */
export function useAppSlot(
  slot: AppSlot
): ReadonlyArray<ComponentType<never>> {
  return useSlotComponents(slot) as ReadonlyArray<ComponentType<never>>;
}
