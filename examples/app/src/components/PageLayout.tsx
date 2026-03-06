import type { PluginHost } from '@react-pkl/core';
import type { AppContext, PluginRoute } from 'example-sdk';
import { useAppLayout, AppHeader, AppSidebar } from 'example-sdk';
import { Link } from 'react-router-dom';

/**
 * PageLayout - Shared layout wrapper for all pages
 * 
 * Provides consistent header and sidebar layout with themeable components.
 * Used by both the home page (Shell) and settings page.
 */
export function PageLayout({ 
  host, 
  pluginRoutes, 
  currentPath, 
  children 
}: { 
  host: PluginHost<AppContext>; 
  pluginRoutes: Map<string, PluginRoute>; 
  currentPath: string;
  children: React.ReactNode;
}) {
  const layout = useAppLayout();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      {/* Toolbar - themeable layout slot */}
      <AppHeader toolbar={layout.toolbar} />

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Sidebar - themeable layout slot */}
        <AppSidebar pluginRoutes={pluginRoutes} sidebarItems={layout.sidebar} Link={Link} />

        {/* Main content */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
