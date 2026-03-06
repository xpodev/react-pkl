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
  AppHeader,
  AppSidebar,
  AppDashboard,
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
    
    // Step 2: Create a placeholder context (will add pluginHost after)
    const appContext = createMockAppContext(
      null as any, // Placeholder for pluginHost
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
    
    // Step 4: Now set the pluginHost reference in the context
    appContext.pluginHost = pluginHost;
    
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
      
      // Step 5: Restore saved theme from localStorage
      const savedThemeId = localStorage.getItem('react-pkl:active-theme');
      if (savedThemeId && savedThemeId !== 'default') {
        // Find the theme plugin
        const allPlugins = registry.getAll().map(e => e.module);
        const themePlugin = allPlugins.find(
          p => p.meta.id === savedThemeId && typeof p.onThemeEnable === 'function'
        );
        if (themePlugin) {
          host.setThemePlugin(themePlugin);
        }
      }
      
      setReady(true);
    }
    void loadPlugins();
  }, [manager, provider, registry, host]);

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
                  <Route path="/settings" element={<SettingsPage host={host} pluginRoutes={pluginRoutes} />} />
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
// PageLayout – shared layout wrapper for all pages
// ---------------------------------------------------------------------------

function PageLayout({ 
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

// ---------------------------------------------------------------------------
// Shell – home page
// ---------------------------------------------------------------------------

function Shell({ host, pluginRoutes }: { host: PluginHost<AppContext>; pluginRoutes: Map<string, PluginRoute> }) {
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
// ThemeSelector – dropdown to select active theme plugin
// ---------------------------------------------------------------------------

function ThemeSelector({ host }: { host: PluginHost<AppContext> }) {
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

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// SettingsPage – accessible via /settings route
// ---------------------------------------------------------------------------

function SettingsPage({ host, pluginRoutes }: { host: PluginHost<AppContext>; pluginRoutes: Map<string, PluginRoute> }) {
  const layout = useAppLayout();

  return (
    <PageLayout host={host} pluginRoutes={pluginRoutes} currentPath="/settings">
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

