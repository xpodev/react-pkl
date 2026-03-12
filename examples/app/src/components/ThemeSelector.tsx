import { useEffect, useState } from 'react';
import type { PluginHost } from '@pkl.js/react';
import type { AppContext } from 'example-sdk';

/**
 * ThemeSelector - Dropdown component for selecting active theme
 * 
 * Displays all available theme plugins (those with onThemeEnable method).
 * Persists selection to localStorage and restores on page load.
 */
export function ThemeSelector({ host }: { host: PluginHost<AppContext> }) {
  const manager = host.getManager();
  const registry = host.getRegistry();
  const [currentTheme, setCurrentTheme] = useState(() => host.getThemePlugin());
  
  // Subscribe to host changes (theme changes trigger re-render)
  useEffect(() => {
    const unsubscribe = host.subscribe(() => {
      setCurrentTheme(host.getThemePlugin());
    });
    return unsubscribe;
  }, [host]);
  
  // Get all plugins (enabled + static) that have onThemeEnable (theme plugins)
  // Static plugins don't need to be "enabled" to be used as themes
  const themePlugins = registry
    .getAll()
    .map(entry => entry.module)
    .filter(plugin => typeof plugin.onThemeEnable === 'function');

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    
    // Save theme preference to localStorage
    localStorage.setItem('react-pkl:active-theme', selectedId);
    
    if (selectedId === 'default') {
      host.setThemePlugin(null);
    } else {
      const plugin = themePlugins.find(p => p.meta.id === selectedId);
      if (plugin) {
        host.setThemePlugin(plugin);
      }
    }
  };

  return (
    <section
      style={{
        padding: 16,
        background: 'var(--card-bg, #f8fafc)',
        borderRadius: 8,
        border: '1px solid var(--border-color, #e2e8f0)',
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: 16, color: 'var(--text-primary, inherit)' }}>
        🎨 Theme
      </h3>
      <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: 14, marginBottom: 12 }}>
        Select a theme to customize the appearance of the application
      </p>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <label
          htmlFor="theme-select"
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text-primary, inherit)',
          }}
        >
          Active Theme:
        </label>
        <select
          id="theme-select"
          value={currentTheme?.meta.id || 'default'}
          onChange={handleThemeChange}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid var(--border-color, #cbd5e1)',
            background: 'var(--bg-primary, white)',
            color: 'var(--text-primary, inherit)',
            fontSize: 14,
            cursor: 'pointer',
            minWidth: 200,
          }}
        >
          <option value="default">Default (Light)</option>
          {themePlugins.map(plugin => (
            <option key={plugin.meta.id} value={plugin.meta.id}>
              {plugin.meta.name}
            </option>
          ))}
        </select>
      </div>
      
      {themePlugins.length === 0 && (
        <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: 13, marginTop: 12, marginBottom: 0 }}>
          No theme plugins available. Enable a theme plugin to customize the appearance.
        </p>
      )}
      
      {currentTheme && (
        <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: 13, marginTop: 12, marginBottom: 0 }}>
          <strong>{currentTheme.meta.name}</strong> - {currentTheme.meta.description}
        </p>
      )}
    </section>
  );
}
