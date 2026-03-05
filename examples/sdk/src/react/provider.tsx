import { PluginProvider } from '@react-pkl/core/react';
import type { ReactNode } from 'react';
import type { AppContext } from '../app-context.js';
import type { AppPlugin } from '../plugin.js';
import type { PluginClient, PluginManager, PluginRegistry } from '@react-pkl/core';
import { AppReactContext } from './app-context.js';

type PluginSource =
  | { registry: PluginRegistry<AppContext> }
  | { manager: PluginManager<AppContext> }
  | { client: PluginClient<AppContext> };

export type AppPluginProviderProps = {
  /**
   * The host application context value that plugins will receive in `activate`
   * and can read via `useAppContext()`.
   */
  context: AppContext;
  children: ReactNode;
} & PluginSource;

/**
 * AppPluginProvider
 *
 * Combines two concerns in one component:
 * 1. Provides the `AppContext` value so plugin components can call `useAppContext()`.
 * 2. Wraps the core `PluginProvider` so hooks like `usePlugins()` work.
 *
 * @example
 * ```tsx
 * const manager = createAppManager();
 * manager.setContext(appContext);
 *
 * <AppPluginProvider manager={manager} context={appContext}>
 *   <App />
 * </AppPluginProvider>
 * ```
 */
export function AppPluginProvider({
  context,
  children,
  ...source
}: AppPluginProviderProps): ReactNode {
  return (
    <AppReactContext.Provider value={context}>
      <PluginProvider {...(source as Parameters<typeof PluginProvider<AppContext>>[0])}>
        {children}
      </PluginProvider>
    </AppReactContext.Provider>
  );
}

// Suppress unused import warning – AppPlugin is re-exported for consumers.
export type { AppPlugin };
