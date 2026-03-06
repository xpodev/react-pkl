import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { 
  createAppHost, 
  AppLayoutProvider,
  ToolbarSlotProvider,
  SidebarSlotProvider,
  DashboardSlotProvider,
  SettingsSlotProvider,
} from 'example-sdk';
import { AppPluginProvider, PluginEntrypoints } from 'example-sdk/react';
import { createMockAppContext } from './mock-context.js';
import { LocalStoragePluginProvider } from './local-storage-adapter.js';
import { Shell } from './pages/Shell.js';
import { SettingsPage } from './pages/SettingsPage.js';
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
