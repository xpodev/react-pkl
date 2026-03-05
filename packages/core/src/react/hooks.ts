import { useContext, useMemo, type ComponentType } from 'react';
import type { PluginEntry, PluginMeta } from '../types.js';
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
// useSlotComponents – returns all components for a given slot name
// ---------------------------------------------------------------------------

export function useSlotComponents(
  slot: string
): ReadonlyArray<ComponentType<unknown>> {
  const { registry, version: _version } = usePluginContext();
  return useMemo(
    () =>
      registry
        .getEnabled()
        .flatMap((e) => {
          const comp = e.module.components?.[slot];
          return comp ? [comp] : [];
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [registry, _version, slot]
  );
}
