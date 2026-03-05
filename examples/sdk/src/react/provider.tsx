import { PluginProvider } from '@react-pkl/core/react';
import type { ReactNode } from 'react';
import type { AppContext } from '../app-context.js';
import type { AppPlugin } from '../plugin.js';
import type { PluginHost } from '@react-pkl/core';
import { AppReactContext } from './app-context.js';

export type AppPluginProviderProps = {
  /**
   * The host application context value that plugins will receive in `activate`
   * and can read via `useAppContext()`.
   */
  context: AppContext;
  /**
   * The PluginHost instance managing plugin lifecycle and resources.
   */
  host: PluginHost<AppContext>;
  children: ReactNode;
};

/**
 * AppPluginProvider
 *
 * Combines two concerns in one component:
 * 1. Provides the `AppContext` value so plugin components can call `useAppContext()`.
 * 2. Wraps the core `PluginProvider` so hooks like `usePlugins()` work.
 *
 * @example
 * ```tsx
 * const host = createAppHost(appContext);
 *
 * <AppPluginProvider host={host} context={appContext}>
 *   <App />
 * </AppPluginProvider>
 * ```
 */
export function AppPluginProvider({
  context,
  host,
  children,
}: AppPluginProviderProps): ReactNode {
  return (
    <AppReactContext.Provider value={context}>
      <PluginProvider host={host}>
        {children}
      </PluginProvider>
    </AppReactContext.Provider>
  );
}

// Suppress unused import warning – AppPlugin is re-exported for consumers.
export type { AppPlugin };
