import type { PluginHost } from '@react-pkl/core';
import type { AppContext } from 'example-sdk';
import { AppHeader, AppSidebar } from 'example-sdk';

/**
 * PageLayout - Shared layout wrapper for all pages
 * 
 * Provides consistent header and sidebar layout with themeable components.
 * Used by both the home page (Shell) and settings page.
 * 
 * Layout slots use context directly - no need to pass props!
 */
export function PageLayout({ 
  host, 
  currentPath, 
  children 
}: { 
  host: PluginHost<AppContext>;
  currentPath: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      {/* Toolbar - themeable layout slot (uses context) */}
      <AppHeader />

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Sidebar - themeable layout slot (uses context) */}
        <AppSidebar />

        {/* Main content */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
