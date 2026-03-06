import { createLayoutSlot } from '@react-pkl/core/react';
import { useRouter } from './react/services.js';
import { useAppLayout } from './slots.js';

/**
 * Default Header layout slot component.
 * Can be overridden by theme plugins to customize the header appearance.
 * 
 * Uses context hooks to access toolbar items from the layout provider.
 * 
 * @example
 * ```tsx
 * // In theme plugin:
 * layout(slots) {
 *   slots.set(AppHeader, () => {
 *     const layout = useAppLayout();
 *     return (
 *       <header className="my-custom-header">{layout.toolbar}</header>
 *     );
 *   });
 * }
 * ```
 */
export const AppHeader = createLayoutSlot<{}>(
  function DefaultHeader() {
    const layout = useAppLayout();
    
    return (
      <header
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          padding: '8px 16px',
          background: 'var(--card-bg, #f1f5f9)',
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <strong style={{ marginRight: 'auto', color: 'var(--text-primary, inherit)' }}>My App</strong>
        {layout.toolbar}
      </header>
    );
  }
);

/**
 * Default Sidebar layout slot component.
 * Can be overridden by theme plugins to customize the sidebar appearance.
 * 
 * Uses context hooks to access plugin routes and sidebar items.
 */
export const AppSidebar = createLayoutSlot<{}>(
  function DefaultSidebar() {
    const router = useRouter();
    const layout = useAppLayout();
    const pluginRoutes = router.getRoutes();

    const handleNavigate = (path: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      router.navigate(path);
    };

    return (
      <aside
        style={{
          width: 200,
          background: 'var(--card-bg, #f8fafc)',
          borderRadius: 8,
          padding: 16,
        }}
      >
        <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 13, color: 'var(--text-primary, inherit)' }}>
          Navigation
        </p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <a
            href="/"
            onClick={handleNavigate('/')}
            style={{
              fontSize: 13,
              color: 'var(--link-color, #0369a1)',
              textDecoration: 'none',
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            🏠 Home
          </a>
          <a
            href="/settings"
            onClick={handleNavigate('/settings')}
            style={{
              fontSize: 13,
              color: 'var(--link-color, #0369a1)',
              textDecoration: 'none',
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            ⚙ Settings
          </a>
          {/* Plugin routes */}
          {Array.from(pluginRoutes.values())
            .filter((r) => r.label)
            .map((route) => (
              <a
                key={route.path}
                href={route.path}
                onClick={handleNavigate(route.path)}
                style={{
                  fontSize: 13,
                  color: 'var(--link-color, #0369a1)',
                  textDecoration: 'none',
                  padding: '4px 8px',
                  cursor: 'pointer',
                }}
              >
                {route.label}
              </a>
            ))}
        </nav>
        <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid var(--border-color, #e2e8f0)' }} />
        <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 13, color: 'var(--text-primary, inherit)' }}>
          Sidebar Plugins
        </p>
        {layout.sidebar.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--text-muted, #94a3b8)' }}>No sidebar plugins.</p>
        ) : (
          layout.sidebar
        )}
      </aside>
    );
  }
);

/**
 * Default Dashboard layout slot component.
 * Can be overridden by theme plugins to customize the dashboard appearance.
 * 
 * Uses context hooks to access dashboard items from the layout provider.
 */
export const AppDashboard = createLayoutSlot<{}>(
  function DefaultDashboard() {
    const layout = useAppLayout();
    
    return (
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        }}
      >
        {layout.dashboard.length === 0 ? (
          <p style={{ color: 'var(--text-muted, #94a3b8)' }}>No dashboard plugins loaded.</p>
        ) : (
          layout.dashboard
        )}
      </div>
    );
  }
);
