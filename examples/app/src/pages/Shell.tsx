import type { PluginHost } from '@react-pkl/core';
import type { AppContext, PluginRoute } from 'example-sdk';
import { useAppLayout, AppDashboard } from 'example-sdk';
import { PageLayout } from '../components/PageLayout.js';
import { PluginDebugPanel } from '../components/PluginDebugPanel.js';

/**
 * Shell - Home/Dashboard page
 * 
 * Main landing page that displays the dashboard with plugin-contributed widgets
 * and the plugin debug panel for managing plugins.
 */
export function Shell({ host, pluginRoutes }: { host: PluginHost<AppContext>; pluginRoutes: Map<string, PluginRoute> }) {
  const layout = useAppLayout();

  return (
    <PageLayout host={host} pluginRoutes={pluginRoutes} currentPath="/">
      <h2 style={{ marginTop: 0, color: 'var(--text-primary, inherit)' }}>Dashboard</h2>
      
      {/* Dashboard - themeable layout slot */}
      <AppDashboard dashboardItems={layout.dashboard} />

      <PluginDebugPanel host={host} />
    </PageLayout>
  );
}
