import { createContext, useContext } from 'react';
import type { AppContext } from '../app-context.js';

const AppReactContext = createContext<AppContext | null>(null);
AppReactContext.displayName = 'AppContext';

export { AppReactContext };

/**
 * useAppContext
 *
 * Access the host application context from inside any plugin component.
 * Must be rendered within an <AppContextProvider>.
 *
 * @example
 * ```tsx
 * function MyWidget() {
 *   const { user, notifications } = useAppContext();
 *   return <button onClick={() => notifications.show('Hi!')}>Greet</button>;
 * }
 * ```
 */
export function useAppContext(): AppContext {
  const ctx = useContext(AppReactContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside an <AppContextProvider>.');
  }
  return ctx;
}
