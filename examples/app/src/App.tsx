import { useEffect, useState, useRef, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  createAppHost, 
  AppLayoutProvider,
  ToolbarSlotProvider,
  SidebarSlotProvider,
  DashboardSlotProvider,
  SettingsSlotProvider,
} from 'example-sdk';
import { 
  AppPluginProvider, 
  PluginEntrypoints,
  NotificationsProvider,
  RouterProvider,
  UserProvider,
  LoggerProvider,
} from 'example-sdk/react';
import { createNotificationService, type Notification } from './services/notifications.js';
import { createRouterService } from './services/router.js';
import { createLoggerService } from './services/logger.js';
import { LocalStoragePluginProvider } from './local-storage-adapter.js';
import { Shell } from './pages/Shell.js';
import { SettingsPage } from './pages/SettingsPage.js';
import type { PluginHost } from '@pkl.js/react';
import type { UserInfo } from 'example-sdk';

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
  const location = useLocation();
  
  // Application state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user] = useState<UserInfo>({
    id: 'user-1',
    name: 'Alice Dev',
    email: 'alice@example.com',
    role: 'admin',
  });
  
  // Create services
  const notificationService = useMemo(
    () => createNotificationService(setNotifications),
    []
  );
  
  const routerService = useMemo(
    () => createRouterService(
      (path) => navigate(path),
      () => location.pathname
    ),
    [navigate, location.pathname]
  );
  
  const loggerService = useMemo(() => createLoggerService(), []);
  
  // Plugin host and provider - created once
  const [state] = useState(() => {
    // Step 1: Create the plugin provider
    const provider = new LocalStoragePluginProvider();
    
    // Step 2: Create the plugin host (no context needed in v0.3.0)
    const pluginHost = createAppHost();
    
    return { provider, host: pluginHost };
  });
  
  const { provider, host } = state;
  
  // Get the plugin registry and manager from the host
  const registry = host.getRegistry();
  const manager = host.getManager();
  
  // Subscribe to plugin state changes and save to provider
  useEffect(() => {
    const unsubscribe = registry.subscribe((event: import('@pkl.js/react').PluginEvent) => {
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
      // Step 3: Get plugins from provider and load them
      const plugins = provider.getPlugins();
      for (const plugin of plugins) {
        await manager.add(plugin.loader, { enabled: plugin.enabled });
      }
      
      // Step 4: Restore saved theme from localStorage
      const savedThemeId = localStorage.getItem('react-pkl:active-theme');
      if (savedThemeId && savedThemeId !== 'default') {
        // Find the theme plugin
        const allPlugins = registry.getAll().map((e: any) => e.module);
        const themePlugin = allPlugins.find(
          (p: any) => p.meta.id === savedThemeId && typeof p.onThemeEnable === 'function'
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
    <NotificationsProvider value={notificationService}>
      <RouterProvider value={routerService}>
        <UserProvider value={user}>
          <LoggerProvider value={loggerService}>
            <AppLayoutProvider initialLayout={{ toolbar: [], sidebar: [], dashboard: [], settings: [] }}>
              <AppPluginProvider host={host}>
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
                        <Routes>
                          <Route path="/" element={<Shell host={host} />} />
                          <Route path="/settings" element={<SettingsPage host={host} />} />
                          {/* 404 page */}
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                      </SettingsSlotProvider>
                    </DashboardSlotProvider>
                  </SidebarSlotProvider>
                </ToolbarSlotProvider>
              </AppPluginProvider>
            </AppLayoutProvider>
          </LoggerProvider>
        </UserProvider>
      </RouterProvider>
    </NotificationsProvider>
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
