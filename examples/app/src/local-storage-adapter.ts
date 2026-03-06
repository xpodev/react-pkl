import type { PluginProvider, PluginDescriptor } from '@react-pkl/core';
import {
  helloPlugin,
  userGreetingPlugin,
  settingsShortcutPlugin,
  customPagePlugin,
  darkThemePlugin,
} from 'example-plugins';

/**
 * LocalStoragePluginProvider - Provides plugins with state persisted in localStorage
 * 
 * This provider knows about all available plugins and uses localStorage
 * to remember which ones should be enabled/disabled.
 */
export class LocalStoragePluginProvider implements PluginProvider {
  private readonly storageKey: string;
  private readonly availablePlugins = [
    { id: 'example.hello', loader: () => helloPlugin, defaultEnabled: true },
    { id: 'example.user-greeting', loader: () => userGreetingPlugin, defaultEnabled: true },
    { id: 'example.settings-shortcut', loader: () => settingsShortcutPlugin, defaultEnabled: true },
    { id: 'example.custom-page', loader: () => customPagePlugin, defaultEnabled: true },
    { id: 'example.dark-theme', loader: () => darkThemePlugin, defaultEnabled: false },
  ];

  constructor(storageKey = 'react-pkl:plugin-states') {
    this.storageKey = storageKey;
  }

  getPlugins(): PluginDescriptor[] {
    const savedStates = this._loadStates();
    
    return this.availablePlugins.map(plugin => ({
      id: plugin.id,
      loader: plugin.loader,
      // Use saved state if available, otherwise use default
      enabled: savedStates[plugin.id] ?? plugin.defaultEnabled,
    }));
  }

  savePluginState(pluginId: string, enabled: boolean): void {
    try {
      const states = this._loadStates();
      states[pluginId] = enabled;
      localStorage.setItem(this.storageKey, JSON.stringify(states));
    } catch (error) {
      console.error('Failed to save plugin state to localStorage:', error);
    }
  }

  private _loadStates(): Record<string, boolean> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (error) {
      console.error('Failed to read plugin states from localStorage:', error);
      return {};
    }
  }
}
