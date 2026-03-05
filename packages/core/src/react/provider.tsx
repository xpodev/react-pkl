import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { PluginClient } from '../plugin-client.js';
import type { PluginManager } from '../plugin-manager.js';
import type { PluginRegistry } from '../plugin-registry.js';
import { PluginContext, type PluginContextValue } from './context.js';

type PluginSource<TContext> =
  | { type: 'registry'; registry: PluginRegistry<TContext> }
  | { type: 'manager'; manager: PluginManager<TContext> }
  | { type: 'client'; client: PluginClient<TContext> };

export type PluginProviderProps<TContext = unknown> = {
  children: ReactNode;
} & (
  | { registry: PluginRegistry<TContext> }
  | { manager: PluginManager<TContext> }
  | { client: PluginClient<TContext> }
);

/**
 * PluginProvider
 *
 * Wraps part of the React tree with plugin system access.
 * Accepts a `registry`, `manager`, or `client` as its source.
 */
export function PluginProvider<TContext = unknown>(
  props: PluginProviderProps<TContext>
): ReactNode {
  const { children, ...rest } = props;

  const source = useMemo<PluginSource<TContext>>(() => {
    if ('registry' in rest) return { type: 'registry', registry: rest.registry };
    if ('manager' in rest) return { type: 'manager', manager: rest.manager };
    return { type: 'client', client: rest.client };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registry = useMemo<PluginRegistry<TContext>>(() => {
    if (source.type === 'registry') return source.registry;
    if (source.type === 'manager') return source.manager.registry;
    return source.client.registry;
  }, [source]);

  const [version, setVersion] = useState(0);
  const versionRef = useRef(version);
  versionRef.current = version;

  useEffect(() => {
    return registry.subscribe(() => {
      setVersion((v) => v + 1);
    });
  }, [registry]);

  const value = useMemo<PluginContextValue<TContext>>(
    () => ({ registry, version }),
    [registry, version]
  );

  return (
    <PluginContext.Provider value={value}>
      {children}
    </PluginContext.Provider>
  );
}
