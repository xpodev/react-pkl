import { createContext } from 'react';
import type { PluginRegistry } from '../plugin-registry.js';

export interface PluginContextValue<TContext = unknown> {
  registry: PluginRegistry<TContext>;
  /**
   * Incremented on every change to force hook re-renders.
   * Internal use only.
   */
  version: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PluginContext = createContext<PluginContextValue<any> | null>(null);
