import { createLayoutSlot } from '@react-pkl/core/react';
import type { PluginRoute } from './app-context.js';

/**
 * Default Header layout slot component.
 * Can be overridden by theme plugins to customize the header appearance.
 * 
 * @example
 * ```tsx
 * // In theme plugin:
 * layout(slots) {
 *   slots.set(AppHeader, ({ toolbar }) => (
 *     <header className="my-custom-header">{toolbar}</header>
 *   ));
 * }
 * ```
 */
export const AppHeader = createLayoutSlot<{ toolbar: React.ReactNode[] }>(
  function DefaultHeader({ toolbar }) {
    return (
      <header
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          padding: '8px 16px',
          background: '#f1f5f9',
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <strong style={{ marginRight: 'auto' }}>My App</strong>
        {toolbar}
      </header>
    );
  }
);

/**
 * Default Sidebar layout slot component.
 * Can be overridden by theme plugins to customize the sidebar appearance.
 */
export const AppSidebar = createLayoutSlot<{
  pluginRoutes: Map<string, PluginRoute>;
  sidebarItems: React.ReactNode[];
  Link: any; // React Router Link component
}>(function DefaultSidebar({ pluginRoutes, sidebarItems, Link }) {
  return (
    <aside
      style={{
        width: 200,
        background: '#f8fafc',
        borderRadius: 8,
        padding: 16,
      }}
    >
      <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 13 }}>
        Navigation
      </p>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Link
          to="/"
          style={{
            fontSize: 13,
            color: '#0369a1',
            textDecoration: 'none',
            padding: '4px 8px',
          }}
        >
          🏠 Home
        </Link>
        <Link
          to="/settings"
          style={{
            fontSize: 13,
            color: '#0369a1',
            textDecoration: 'none',
            padding: '4px 8px',
          }}
        >
          ⚙ Settings
        </Link>
        {/* Plugin routes */}
        {Array.from(pluginRoutes.values())
          .filter((r) => r.label)
          .map((route) => (
            <Link
              key={route.path}
              to={route.path}
              style={{
                fontSize: 13,
                color: '#0369a1',
                textDecoration: 'none',
                padding: '4px 8px',
              }}
            >
              {route.label}
            </Link>
          ))}
      </nav>
      <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
      <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 13 }}>
        Sidebar Plugins
      </p>
      {sidebarItems.length === 0 ? (
        <p style={{ fontSize: 12, color: '#94a3b8' }}>No sidebar plugins.</p>
      ) : (
        sidebarItems
      )}
    </aside>
  );
});

/**
 * Default Dashboard layout slot component.
 * Can be overridden by theme plugins to customize the dashboard appearance.
 */
export const AppDashboard = createLayoutSlot<{ dashboardItems: React.ReactNode[] }>(
  function DefaultDashboard({ dashboardItems }) {
    return (
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        }}
      >
        {dashboardItems.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No dashboard plugins loaded.</p>
        ) : (
          dashboardItems
        )}
      </div>
    );
  }
);
