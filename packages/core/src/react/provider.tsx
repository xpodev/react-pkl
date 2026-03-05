import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { PluginHost } from '../plugin-host.js';
import { PluginContext, type PluginContextValue } from './context.js';

export interface PluginProviderProps<TContext = unknown> {
  children: ReactNode;
  host: PluginHost<TContext>;
}

/**
 * PluginProvider
 *
 * Wraps part of the React tree with plugin system access.
 * Provides access to the plugin host, registry, and current plugin context.
 */
export function PluginProvider<TContext = unknown>(
  props: PluginProviderProps<TContext>
): ReactNode {
  const { children, host } = props;

  const [version, setVersion] = useState(0);
  const versionRef = useRef(version);
  versionRef.current = version;

  // Subscribe to both registry and host changes
  useEffect(() => {
    const unsubRegistry = host.registry.subscribe(() => {
      setVersion((v) => v + 1);
    });

    const unsubHost = host.subscribe(() => {
      setVersion((v) => v + 1);
    });

    return () => {
      unsubRegistry();
      unsubHost();
    };
  }, [host]);

  const value = useMemo<PluginContextValue<TContext>>(
    () => ({ 
      registry: host.registry, 
      host,
      currentPlugin: host.getCurrentPlugin(),
      version 
    }),
    [host, version]
  );

  return (
    <PluginContext.Provider value={value}>
      {children}
    </PluginContext.Provider>
  );
}
