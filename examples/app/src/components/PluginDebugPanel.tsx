import { useState } from 'react';
import { useAppPluginMeta } from 'example-sdk/react';
import type { PluginHost } from '@react-pkl/core';
import type { AppContext } from 'example-sdk';
import { isStaticPlugin } from '@react-pkl/core';

/**
 * PluginDebugPanel - Development tool for managing plugins
 * 
 * Displays all registered plugins with their status and allows toggling them on/off.
 * Does not show static plugins (those without activate/deactivate) as they cannot be toggled.
 */
export function PluginDebugPanel({ host }: { host: PluginHost<AppContext> }) {
  const meta = useAppPluginMeta();
  const [, forceUpdate] = useState(0);
  const manager = host.getManager();

  return (
    <section
      style={{
        marginTop: 32,
        padding: 16,
        background: 'var(--card-bg, #f8fafc)',
        borderRadius: 8,
        border: '1px solid var(--border-color, #e2e8f0)',
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: 16, color: 'var(--text-primary, inherit)' }}>
        🔌 Plugin Manager
      </h3>
      <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: 14, marginBottom: 16 }}>
        Enable or disable plugins to see real-time changes
      </p>
      
      {meta.length === 0 ? (
        <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: 14 }}>
          No plugins registered.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {meta.map((plugin) => {
            const entry = host.getRegistry().get(plugin.id);
            if (!entry) return null;
            
            // Don't show static plugins as they can't be toggled
            const isStatic = isStaticPlugin(entry.module);
            if (isStatic) return null;
            
            const isEnabled = entry.status === 'enabled';

            return (
              <div
                key={plugin.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  background: 'var(--bg-primary, white)',
                  borderRadius: 6,
                  border: '1px solid var(--border-color, #e2e8f0)',
                }}
              >
                <div>
                  <strong style={{ fontSize: 14, color: 'var(--text-primary, inherit)' }}>
                    {plugin.name}
                  </strong>
                  {plugin.description && (
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary, #64748b)' }}>
                      {plugin.description}
                    </p>
                  )}
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted, #94a3b8)' }}>
                    {plugin.id} · v{plugin.version}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (isEnabled) {
                      await manager.disable(plugin.id);
                    } else {
                      await manager.enable(plugin.id);
                    }
                    forceUpdate((v) => v + 1);
                  }}
                  style={{
                    padding: '6px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    background: isEnabled ? 'var(--accent-color, #0369a1)' : '#e2e8f0',
                    color: isEnabled ? 'white' : 'var(--text-primary, #0f172a)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isEnabled
                      ? 'var(--accent-hover, #0284c7)'
                      : '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isEnabled
                      ? 'var(--accent-color, #0369a1)'
                      : '#e2e8f0';
                  }}
                >
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
