import type { PluginHost } from '@react-pkl/core';
import type { AppContext } from 'example-sdk';
import { AppDashboard } from 'example-sdk';
import { PageLayout } from '../components/PageLayout.js';
import { PluginDebugPanel } from '../components/PluginDebugPanel.js';

/**
 * Shell - Home/Dashboard page
 * 
 * Main landing page that displays the dashboard with plugin-contributed widgets
 * and the plugin debug panel for managing plugins.
 */
export function Shell({ host }: { host: PluginHost<AppContext> }) {
  return (
    <PageLayout host={host} currentPath="/">
      <h2 style={{ marginTop: 0, color: 'var(--text-primary, inherit)' }}>Dashboard</h2>
      
      {/* Dashboard - themeable layout slot (uses context) */}
      <AppDashboard />

      <PluginDebugPanel host={host} />
    </PageLayout>
  );
}
