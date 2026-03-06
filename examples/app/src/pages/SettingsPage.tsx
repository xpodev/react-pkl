import type { PluginHost } from '@react-pkl/core';
import type { AppContext } from 'example-sdk';
import { useAppLayout } from 'example-sdk';
import { PageLayout } from '../components/PageLayout.js';
import { ThemeSelector } from '../components/ThemeSelector.js';

/**
 * SettingsPage - Application settings page
 * 
 * Displays application settings including theme selection and any plugin-contributed
 * settings sections.
 */
export function SettingsPage({ host }: { host: PluginHost<AppContext> }) {
  const layout = useAppLayout();

  return (
    <PageLayout host={host} currentPath="/settings">
      <h2 style={{ marginTop: 0, color: 'var(--text-primary, inherit)' }}>Application Settings</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Theme Selection */}
        <ThemeSelector host={host} />
        
        <section style={{ padding: 16, background: 'var(--card-bg, #f8fafc)', borderRadius: 8 }}>
          <h3 style={{ marginTop: 0, fontSize: 16, color: 'var(--text-primary, inherit)' }}>General</h3>
          <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: 14 }}>Basic application settings</p>
        </section>

        {/* Plugin settings sections */}
        {layout.settings.length === 0 ? (
          <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: 14 }}>No plugin settings available.</p>
        ) : (
          layout.settings
        )}
      </div>
    </PageLayout>
  );
}
