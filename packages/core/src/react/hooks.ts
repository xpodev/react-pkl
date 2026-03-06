import { useContext, useMemo, type ComponentType } from 'react';
import type { PluginEntry, PluginMeta, PluginModule } from '../types.js';
import type { PluginHost } from '../plugin-host.js';
import { PluginContext } from './context.js';

function usePluginContext() {
  const ctx = useContext(PluginContext);
  if (!ctx) {
    throw new Error(
      'usePlugin* hooks must be used inside a <PluginProvider>.'
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// usePluginHost – returns the PluginHost instance
// ---------------------------------------------------------------------------

export function usePluginHost<TContext = unknown>(): PluginHost<TContext> {
  const { host } = usePluginContext();
  return host as PluginHost<TContext>;
}

// ---------------------------------------------------------------------------
// useCurrentPlugin – returns the currently executing plugin
// ---------------------------------------------------------------------------

export function useCurrentPlugin<TContext = unknown>(): PluginModule<TContext> | null {
  const { currentPlugin } = usePluginContext();
  return currentPlugin as PluginModule<TContext> | null;
}

// ---------------------------------------------------------------------------
// usePlugins – returns all registered plugin entries
// ---------------------------------------------------------------------------

export function usePlugins<TContext = unknown>(): ReadonlyArray<
  PluginEntry<TContext>
> {
  const { registry, version: _version } = usePluginContext();
  // _version is consumed so React re-renders when registry changes
  return registry.getAll() as ReadonlyArray<PluginEntry<TContext>>;
}

// ---------------------------------------------------------------------------
// useEnabledPlugins – returns only enabled plugin entries
// ---------------------------------------------------------------------------

export function useEnabledPlugins<TContext = unknown>(): ReadonlyArray<
  PluginEntry<TContext>
> {
  const { registry, version: _version } = usePluginContext();
  return registry.getEnabled() as ReadonlyArray<PluginEntry<TContext>>;
}

// ---------------------------------------------------------------------------
// usePlugin – returns a single plugin entry by id
// ---------------------------------------------------------------------------

export function usePlugin<TContext = unknown>(
  id: string
): PluginEntry<TContext> | undefined {
  const { registry, version: _version } = usePluginContext();
  return registry.get(id) as PluginEntry<TContext> | undefined;
}

// ---------------------------------------------------------------------------
// usePluginMeta – returns metadata of all plugins (no TContext needed)
// ---------------------------------------------------------------------------

export function usePluginMeta(): ReadonlyArray<PluginMeta> {
  const { registry, version: _version } = usePluginContext();
  return useMemo(
    () => registry.getAll().map((e) => e.module.meta),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [registry, _version]
  );
}

// ---------------------------------------------------------------------------
// useSlotComponents – DEPRECATED in v0.2.0
// Use layout context and slot providers instead
// ---------------------------------------------------------------------------

/**
 * @deprecated Use layout context and slot providers instead
 */
export function useSlotComponents(
  slot: string
): ReadonlyArray<ComponentType<unknown>> {
  // This hook is deprecated in v0.2.0
  // Components are now registered through slot Item components
  // and accessed via the layout context
  console.warn('useSlotComponents is deprecated. Use layout context and slot providers instead.');
  return [];
}
