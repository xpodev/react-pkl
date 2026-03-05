import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { 
  createAppHost, 
  AppLayoutProvider,
  ToolbarSlotProvider,
  SidebarSlotProvider,
  DashboardSlotProvider,
  SettingsSlotProvider,
  useAppLayout,
} from 'example-sdk';
import { AppPluginProvider, useAppPluginMeta, PluginEntrypoints } from 'example-sdk/react';
import { createMockAppContext } from './mock-context.js';
import { LocalStoragePluginProvider } from './local-storage-adapter.js';
import type { PluginHost } from '@react-pkl/core';
import type { AppContext, PluginRoute } from 'example-sdk';

// ---------------------------------------------------------------------------
// App – wraps everything in BrowserRouter
// ---------------------------------------------------------------------------

export function App() {
  return (
    <BrowserRouter>
      <AppWithRouter />
    </BrowserRouter>
  );
}

// ---------------------------------------------------------------------------
// AppWithRouter – has access to useNavigate()
// ---------------------------------------------------------------------------

function AppWithRouter() {
  const navigate = useNavigate();
  
  // Application state
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: string }>>([]);
  const [pluginRoutes] = useState(() => new Map<string, PluginRoute>());
  const [routeVersion, setRouteVersion] = useState(0);
  
  // Plugin host and context - created once following proper initialization flow
  const [state] = useState(() => {
    // Step 1: Create the plugin provider
    const provider = new LocalStoragePluginProvider();
    
    // Step 2: Create the context (without plugins)
    const appContext = createMockAppContext(
      // onNotify
      (id, message, type) => {
        setNotifications((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 3000);
      },
      // onNavigate
      (path) => {
        navigate(path);
      },
      // routes
      pluginRoutes,
      // onRouteChange
      () => setRouteVersion((v) => v + 1)
    );

    // Step 3: Create the plugin host with context
    const pluginHost = createAppHost(appContext);
    
    return { provider, host: pluginHost, context: appContext };
  });
  
  const { provider, host, context } = state;
  
  // Get the plugin registry and manager from the host
  const registry = host.getRegistry();
  const manager = host.getManager();
  
  // Subscribe to plugin state changes and save to provider
  useEffect(() => {
    const unsubscribe = registry.subscribe((event: import('@react-pkl/core').PluginEvent) => {
      if (event.type === 'enabled' || event.type === 'disabled') {
        if (provider.savePluginState) {
          provider.savePluginState(event.pluginId, event.type === 'enabled');
        }
      }
    });
    return unsubscribe;
  }, [registry, provider]);
  
  // Load plugins once on mount
  const [ready, setReady] = useState(false);
  const loadingStarted = useRef(false);
  useEffect(() => {
    // Prevent duplicate loading in StrictMode (mount/unmount/remount)
    if (loadingStarted.current) {
      return;
    }
    loadingStarted.current = true;

    async function loadPlugins() {
      // Step 4: Get plugins from provider and load them
      const plugins = provider.getPlugins();
      for (const plugin of plugins) {
        await manager.add(plugin.loader, { enabled: plugin.enabled });
      }
      setReady(true);
    }
    void loadPlugins();
  }, [manager, provider]);

  if (!ready) return <p>Loading plugins…</p>;

  return (
    <AppLayoutProvider initialLayout={{ toolbar: [], sidebar: [], dashboard: [], settings: [] }}>
      <AppPluginProvider host={host} context={context}>
        {/* Slot providers wrap the entire app */}
        <ToolbarSlotProvider>
          <SidebarSlotProvider>
            <DashboardSlotProvider>
              <SettingsSlotProvider>
                {/* Render plugin entrypoints - they register with slot providers */}
                <PluginEntrypoints />
                
                {/* Toast notifications */}
                <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 8,
                        background: notif.type === 'error' ? '#fee' : notif.type === 'success' ? '#efe' : notif.type === 'warning' ? '#ffe' : '#e0f2fe',
                        color: notif.type === 'error' ? '#c00' : notif.type === 'success' ? '#090' : notif.type === 'warning' ? '#880' : '#0369a1',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        fontSize: 14,
                      }}
                    >
                      {notif.message}
                    </div>
                  ))}
                </div>

                {/* Routes */}
                <Routes key={routeVersion}>
                  <Route path="/" element={<Shell host={host} pluginRoutes={pluginRoutes} />} />
                  <Route path="/settings" element={<SettingsPage pluginRoutes={pluginRoutes} />} />
                  {/* Dynamic plugin routes */}
                  {Array.from(pluginRoutes.values()).map((route) => (
                    <Route key={route.path} path={route.path} element={<route.component />} />
                  ))}
                  {/* 404 page */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </SettingsSlotProvider>
            </DashboardSlotProvider>
          </SidebarSlotProvider>
        </ToolbarSlotProvider>
      </AppPluginProvider>
    </AppLayoutProvider>
  );
}

// ---------------------------------------------------------------------------
// NotFoundPage – shown when route doesn't exist
// ---------------------------------------------------------------------------

function NotFoundPage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24, textAlign: 'center' }}>
      <h1 style={{ fontSize: 48, margin: '48px 0 16px' }}>404</h1>
      <p style={{ fontSize: 18, color: '#64748b', marginBottom: 24 }}>Page not found</p>
      <Link 
        to="/" 
        style={{ 
          display: 'inline-block',
          padding: '8px 16px', 
          background: '#0369a1', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: 6,
          fontSize: 14
        }}
      >
        Go Home
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shell – renders the application chrome with plugin slots
// ---------------------------------------------------------------------------

function Shell({ host, pluginRoutes }: { host: PluginHost<AppContext>; pluginRoutes: Map<string, PluginRoute> }) {
  const layout = useAppLayout();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      {/* Toolbar */}
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
        {/* Render toolbar components from layout */}
        {layout.toolbar}
      </header>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Sidebar */}
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
            <Link to="/" style={{ fontSize: 13, color: '#0369a1', textDecoration: 'none', padding: '4px 8px' }}>
              🏠 Home
            </Link>
            <Link to="/settings" style={{ fontSize: 13, color: '#0369a1', textDecoration: 'none', padding: '4px 8px' }}>
              ⚙ Settings
            </Link>
            {/* Plugin routes */}
            {Array.from(pluginRoutes.values()).filter(r => r.label).map((route) => (
              <Link key={route.path} to={route.path} style={{ fontSize: 13, color: '#0369a1', textDecoration: 'none', padding: '4px 8px' }}>
                {route.label}
              </Link>
            ))}
          </nav>
          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
          <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 13 }}>
            Sidebar Plugins
          </p>
          {layout.sidebar.length === 0 ? (
            <p style={{ fontSize: 12, color: '#94a3b8' }}>No sidebar plugins.</p>
          ) : (
            layout.sidebar
          )}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Dashboard</h2>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {layout.dashboard.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No dashboard plugins loaded.</p>
            ) : (
              layout.dashboard
            )}
          </div>

          <PluginDebugPanel host={host} />
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Debug panel – shows registered plugins and lets you toggle them
// ---------------------------------------------------------------------------

function PluginDebugPanel({
  host,
}: {
  host: PluginHost<AppContext>;
}) {
  const meta = useAppPluginMeta();
  const [, forceUpdate] = useState(0);
  const manager = host.getManager();

  return (
    <section
      style={{
        marginTop: 32,
        padding: 16,
        border: '1px dashed #cbd5e1',
        borderRadius: 8,
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: 14, color: '#475569' }}>
        Registered plugins ({meta.length})
      </h3>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {meta.map((m) => (
          <li key={m.id} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13 }}>
            <span style={{ fontWeight: 500 }}>{m.name}</span>
            <span style={{ color: '#94a3b8' }}>v{m.version}</span>
            <button
              style={{ marginLeft: 'auto', fontSize: 12, cursor: 'pointer' }}
              onClick={async () => {
                const entry = manager.getAll().find((e: import('@react-pkl/core').PluginEntry<AppContext>) => e.module.meta.id === m.id);
                if (!entry) return;
                if (entry.status === 'enabled') {
                  await manager.disable(m.id);
                } else {
                  await manager.enable(m.id);
                }
                forceUpdate((v) => v + 1);
              }}
            >
              {manager.getAll().find((e: import('@react-pkl/core').PluginEntry<AppContext>) => e.module.meta.id === m.id)?.status === 'enabled'
                ? 'Disable'
                : 'Enable'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// SettingsPage – accessible via /settings route
// ---------------------------------------------------------------------------

function SettingsPage({ pluginRoutes }: { pluginRoutes: Map<string, PluginRoute> }) {
  const layout = useAppLayout();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      {/* Toolbar */}
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
        <strong style={{ marginRight: 'auto' }}>My App - Settings</strong>
        {/* Render toolbar components from layout */}
        {layout.toolbar}
      </header>

      <div style={{ display: 'flex', gap: 24 }}>
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
            <Link to="/" style={{ fontSize: 13, color: '#0369a1', textDecoration: 'none', padding: '4px 8px' }}>
              🏠 Home
            </Link>
            <Link to="/settings" style={{ fontSize: 13, color: '#0369a1', textDecoration: 'none', padding: '4px 8px', fontWeight: 600 }}>
              ⚙ Settings
            </Link>
            {/* Plugin routes */}
            {Array.from(pluginRoutes.values()).filter(r => r.label).map((route) => (
              <Link key={route.path} to={route.path} style={{ fontSize: 13, color: '#0369a1', textDecoration: 'none', padding: '4px 8px' }}>
                {route.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Application Settings</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section style={{ padding: 16, background: '#f8fafc', borderRadius: 8 }}>
              <h3 style={{ marginTop: 0, fontSize: 16 }}>General</h3>
              <p style={{ color: '#64748b', fontSize: 14 }}>Basic application settings</p>
            </section>

            {/* Plugin settings sections */}
            {layout.settings.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 14 }}>No plugin settings available.</p>
            ) : (
              layout.settings
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
