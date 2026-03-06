---
sidebar_position: 2
title: Getting Started
---

# Getting Started with React PKL

This guide will walk you through creating your first plugin system with React PKL.

## Table of Contents

1. [Installation](#installation)
2. [Understanding the Architecture](#understanding-the-architecture)
3. [Creating Your SDK](#creating-your-sdk)
4. [Integrating with Your React App](#integrating-with-your-react-app)
5. [Writing Your First Plugin](#writing-your-first-plugin)
6. [Building Plugins](#building-plugins)
7. [Next Steps](#next-steps)

## Installation

React PKL is a monorepo with multiple packages. For a basic setup, you'll need:

```bash
# Install the core package
npm install @react-pkl/core react

# Install the SDK package for building plugins (dev dependency)
npm install --save-dev @react-pkl/sdk
```

## Understanding the Architecture

React PKL uses a **three-layer architecture**:

```
┌─────────────────────────────────────┐
│      Your Plugin Developers         │
│   (Uses your custom SDK)            │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│         Your Custom SDK             │
│   (Built on React PKL)              │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│        React PKL Core               │
│   (Plugin management system)        │
└─────────────────────────────────────┘
```

**Important:** Plugin developers don't use React PKL directly. They use **your custom SDK** that you build on top of React PKL.

## Creating Your SDK

### Step 1: Define Your Service Interfaces

First, define the service interfaces you'll expose to plugins. Each service will have its own React context and hook:

```typescript
// my-app-sdk/src/app-context.ts

/**
 * Notification service for showing messages to users
 */
export interface NotificationService {
  show(message: string, type?: 'info' | 'success' | 'warning' | 'error'): string;
  dismiss(id: string): void;
}

/**
 * Router service for navigation
 */
export interface RouterService {
  navigate(path: string): void;
  getCurrentPath(): string;
}

/**
 * User information
 */
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

/**
 * Logger service for debugging
 */
export interface LoggerService {
  log(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}
```

> **Architecture Note:** Instead of bundling all services into a single context, we create separate service interfaces that will each have their own React context. This keeps the plugin infrastructure minimal and allows plugins to opt-in to only the services they need.

### Step 2: Define Layout Interface

Define a layout interface that describes all the slots in your application:

```typescript
// my-app-sdk/src/app-layout.ts

/**
 * Layout shape for the app.
 * Each property represents a slot where plugins can inject content.
 */
export interface AppLayout {
  /** Items injected into the top toolbar */
  toolbar: React.ReactNode[];
  /** Items injected into the left sidebar */
  sidebar: React.ReactNode[];
  /** Widgets added to the main dashboard */
  dashboard: React.ReactNode[];
  /** Sections added to the Settings page */
  settings: React.ReactNode[];
}
```

### Step 3: Create Layout Context and Slots

Create a layout context and slot components using React PKL's utilities:

```typescript
// my-app-sdk/src/slots.ts
import { createLayoutContext, createSlot } from '@react-pkl/core/react';
import type { AppLayout } from './app-layout.js';

/**
 * Layout context provides global access to the app's slot state.
 */
export const {
  LayoutProvider: AppLayoutProvider,
  useLayout: useAppLayout,
  useLayoutController: useAppLayoutController,
} = createLayoutContext<AppLayout>();

// Create slot components for each extension point
export const {
  Provider: ToolbarSlotProvider,
  Item: ToolbarItem,
} = createSlot<AppLayout, 'toolbar'>('toolbar', useAppLayoutController);

export const {
  Provider: SidebarSlotProvider,
  Item: SidebarItem,
} = createSlot<AppLayout, 'sidebar'>('sidebar', useAppLayoutController);

export const {
  Provider: DashboardSlotProvider,
  Item: DashboardItem,
} = createSlot<AppLayout, 'dashboard'>('dashboard', useAppLayoutController);

export const {
  Provider: SettingsSlotProvider,
  Item: SettingsItem,
} = createSlot<AppLayout, 'settings'>('settings', useAppLayoutController);
```

> **How it works:** `createSlot` returns `{ Provider, Item }`. The Provider must wrap the part of your app where the slot is rendered. The Item component is what plugins use to register content.

### Step 4: Define Layout Slot Components

Layout slots are themeable components that use `useAppLayout()` to get their content:

```typescript
// my-app-sdk/src/layout-slots.tsx
import { createLayoutSlot } from '@react-pkl/core/react';
import { useAppLayout } from './slots.js';

/**
 * App header with toolbar items
 */
export const AppHeader = createLayoutSlot(() => {
  const { toolbar } = useAppLayout();
  
  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <nav style={{ display: 'flex', gap: '1rem' }}>
        {toolbar}
      </nav>
    </header>
  );
});

/**
 * App sidebar with navigation items
 */
export const AppSidebar = createLayoutSlot(() => {
  const { sidebar } = useAppLayout();
  
  return (
    <aside style={{ width: '250px', padding: '1rem' }}>
      <nav>{sidebar}</nav>
    </aside>
  );
});

/**
 * Dashboard content area
 */
export const AppDashboard = createLayoutSlot(() => {
  const { dashboard } = useAppLayout();
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
      {dashboard}
    </div>
  );
});
```

### Step 5: Create SDK Helpers

Make it easy for plugin developers to use your SDK:

```typescript
// my-app-sdk/src/plugin.ts
import { PluginHost, PluginInfrastructure } from '@react-pkl/core';
import type { PluginModule } from '@react-pkl/core';

// Type alias for your plugins - uses minimal PluginInfrastructure
export type AppPlugin = PluginModule<PluginInfrastructure>;

// Helper function for type inference
export function definePlugin(plugin: AppPlugin): AppPlugin {
  return plugin;
}

// Factory for creating the plugin host (v0.3.0)
export function createAppHost() {
  return new PluginHost<PluginInfrastructure>();
}
```

> **What is PluginInfrastructure?** It's a minimal context type exported by `@react-pkl/core` containing only the essential plugin system infrastructure: `host` (PluginHost), `_resources` (ResourceTracker), and `_pluginId` (string). Your app services are provided separately via React context.

### Step 6: Create React Service Contexts

Provide each service as a separate React context with provider and hook:

```typescript
// my-app-sdk/src/react/services.tsx
import { createContext, useContext, type ReactNode } from 'react';
import type { NotificationService, RouterService, UserInfo, LoggerService } from '../app-context.js';

// Notifications Context
const NotificationsContext = createContext<NotificationService | null>(null);
NotificationsContext.displayName = 'NotificationsContext';

export function NotificationsProvider({ 
  value, 
  children 
}: { 
  value: NotificationService; 
  children: ReactNode;
}) {
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationService {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}

// Router Context
const RouterContext = createContext<RouterService | null>(null);
RouterContext.displayName = 'RouterContext';

export function RouterProvider({ 
  value, 
  children 
}: { 
  value: RouterService; 
  children: ReactNode;
}) {
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterService {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

// User Context
const UserContext = createContext<UserInfo | null>(null);
UserContext.displayName = 'UserContext';

export function UserProvider({ 
  value, 
  children 
}: { 
  value: UserInfo | null; 
  children: ReactNode;
}) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserInfo | null {
  const ctx = useContext(UserContext);
  return ctx; // null is a valid value for logged-out state
}

// Logger Context
const LoggerContext = createContext<LoggerService | null>(null);
LoggerContext.displayName = 'LoggerContext';

export function LoggerProvider({ 
  value, 
  children 
}: { 
  value: LoggerService; 
  children: ReactNode;
}) {
  return <LoggerContext.Provider value={value}>{children}</LoggerContext.Provider>;
}

export function useLogger(): LoggerService {
  const ctx = useContext(LoggerContext);
  if (!ctx) throw new Error('useLogger must be used within LoggerProvider');
  return ctx;
}
```

> **Why separate contexts?** This approach keeps the plugin infrastructure minimal and allows plugins to selectively use only the services they need via hooks. It's easier to extend, test, and maintain.

### Step 6.5: Create Typed Plugin Hooks

Create a simple hooks file that uses `createTypedHooks` to generate typed plugin management hooks:

```typescript
// my-app-sdk/src/react/hooks.ts
import { createTypedHooks, PluginInfrastructure } from '@react-pkl/core/react';

// Create typed hooks for PluginInfrastructure
export const {
  usePlugins: useAppPlugins,
  useEnabledPlugins: useEnabledAppPlugins,
  usePlugin: useAppPlugin,
  usePluginMeta: useAppPluginMeta,
  usePluginHost: useAppPluginHost,
  useCurrentPlugin: useCurrentAppPlugin,
} = createTypedHooks<PluginInfrastructure>();
```

> **Note:** The `createTypedHooks<TContext>()` factory automatically creates typed wrappers for all plugin management hooks. Since we're using `PluginInfrastructure` (the minimal context), these hooks are focused purely on plugin lifecycle management, not app services.

### Step 6.6: Create Plugin Provider

Create a simple re-export of the core PluginProvider:

```typescript
// my-app-sdk/src/react/provider.tsx
export { PluginProvider as AppPluginProvider } from '@react-pkl/core/react';
```

> **Simple!** Since we're using the core infrastructure and separate service contexts, we don't need a custom provider wrapper.

### Step 7: Export Everything

Create the main export files for your SDK:

```typescript
// my-app-sdk/src/index.ts - Main SDK exports
export type { NotificationService, RouterService, LoggerService, UserInfo } from './app-context.js';
export type { AppLayout } from './app-layout.js';

export { 
  AppLayoutProvider,
  useAppLayout,
  useAppLayoutController,
  ToolbarSlotProvider,
  ToolbarItem,
  SidebarSlotProvider,
  SidebarItem,
  DashboardSlotProvider,
  DashboardItem,
  SettingsSlotProvider,
  SettingsItem,
} from './slots.js';

export { 
  AppHeader,
  AppSidebar,
  AppDashboard,
} from './layout-slots.js';

export { 
  definePlugin, 
  createAppHost,
  type AppPlugin,
} from './plugin.js';

// Re-export for convenience
export type { PluginMeta, PluginInfrastructure } from '@react-pkl/core';
```

```typescript
// my-app-sdk/src/react/index.ts - React-specific exports
export { AppPluginProvider } from './provider.js';

// Export plugin management hooks
export {
  useAppPlugins,
  useEnabledAppPlugins,
  useAppPlugin,
  useAppPluginMeta,
  useAppPluginHost,
  useCurrentAppPlugin,
} from './hooks.js';

// Export service providers and hooks
export {
  NotificationsProvider,
  useNotifications,
  RouterProvider,
  useRouter,
  UserProvider,
  useUser,
  LoggerProvider,
  useLogger,
} from './services.js';
  useRouter,
  UserProvider,
  useUser,
  LoggerProvider,
  useLogger,
} from './services.js';

// Re-export PluginEntrypoints for rendering plugin UI
export { PluginEntrypoints } from '@react-pkl/core/react';
```

> **Note:** The main `index.ts` exports types, slots, and plugin helpers. The `react/index.ts` exports React-specific hooks, providers, and service contexts. This modular structure allows plugin developers to import exactly what they need.

### Step 8: Configure package.json

```json
{
  "name": "my-app-sdk",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./react": {
      "types": "./dist/react/index.d.ts",
      "import": "./dist/react/index.js"
    }
  },
  "peerDependencies": {
    "@react-pkl/core": "^0.3.0",
    "react": ">=18.0.0"
  }
}
```

## Integrating with Your React App

### Step 1: Create Service Implementations

Implement the service interfaces you defined:

```typescript
// app/src/services/notifications.ts
import type { NotificationService } from 'my-app-sdk';

export function createNotificationService(): NotificationService {
  const listeners = new Set<() => void>();
  let notifications: Array<{ id: string; message: string; type: string }> = [];

  return {
    show(message: string, type = 'info') {
      const id = Math.random().toString(36);
      notifications.push({ id, message, type });
      listeners.forEach(fn => fn());
      
      // Auto-dismiss after 3 seconds
      setTimeout(() => this.dismiss(id), 3000);
      return id;
    },
    dismiss(id: string) {
      notifications = notifications.filter(n => n.id !== id);
      listeners.forEach(fn => fn());
    },
  };
}
```

```typescript
// app/src/services/router.ts
import type { RouterService } from 'my-app-sdk';

export function createRouterService(
  navigate: (path: string) => void,
  getCurrentPath: () => string
): RouterService {
  return { navigate, getCurrentPath };
}
```

```typescript
// app/src/services/logger.ts
import type { LoggerService } from 'my-app-sdk';

export function createLoggerService(): LoggerService {
  return {
    log: (msg) => console.log(`[App] ${msg}`),
    warn: (msg) => console.warn(`[App] ${msg}`),
    error: (msg) => console.error(`[App] ${msg}`),
  };
}
```

### Step 2: Set Up the Plugin Host and Providers

Compose your app with service providers and the plugin system:

```tsx
// app/src/App.tsx
import { useState, useEffect, useMemo } from 'react';
import { 
  AppPluginProvider,
  AppLayoutProvider,
  NotificationsProvider,
  RouterProvider,
  UserProvider,
  LoggerProvider,
  ToolbarSlotProvider,
  SidebarSlotProvider,
  DashboardSlotProvider,
  AppHeader,
  AppSidebar,
  AppDashboard,
} from 'my-app-sdk/react';
import { createAppHost } from 'my-app-sdk';
import { createNotificationService } from './services/notifications.js';
import { createRouterService } from './services/router.js';
import { createLoggerService } from './services/logger.js';

function App() {
  // Create plugin host (no context needed)
  const host = useMemo(() => createAppHost(), []);
  
  // Create service instances
  const notifications = useMemo(() => createNotificationService(), []);
  const router = useMemo(() => createRouterService(
    (path) => console.log('Navigate to:', path),
    () => window.location.pathname
  ), []);
  const logger = useMemo(() => createLoggerService(), []);
  const [user, setUser] = useState(null);

  // Load plugins on mount
  useEffect(() => {
    async function loadPlugins() {
      try {
        // Load plugins (fetch from server, local imports, etc.)
        const pluginModules = await Promise.all([
          import('./plugins/hello.js'),
          import('./plugins/theme-toggle.js'),
        ]);
        
        pluginModules.forEach(module => {
          host.register(module.default);
        });
        
        // Enable all plugins by default
        host.getPlugins().forEach(plugin => {
          host.enable(plugin.id);
        });
      } catch (error) {
        console.error('Failed to load plugins:', error);
      }
    }
    
    loadPlugins();
  }, [host]);

  return (
    <NotificationsProvider value={notifications}>
      <RouterProvider value={router}>
        <UserProvider value={user}>
          <LoggerProvider value={logger}>
            <AppPluginProvider host={host}>
              <AppLayoutProvider>
                <ToolbarSlotProvider>
                  <SidebarSlotProvider>
                    <DashboardSlotProvider>
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                        <AppHeader />
                        <div style={{ display: 'flex', flex: 1 }}>
                          <AppSidebar />
                          <main style={{ flex: 1, padding: '2rem' }}>
                            <AppDashboard />
                          </main>
                        </div>
                      </div>
                    </DashboardSlotProvider>
                  </SidebarSlotProvider>
                </ToolbarSlotProvider>
              </AppLayoutProvider>
            </AppPluginProvider>
          </LoggerProvider>
        </UserProvider>
      </RouterProvider>
    </NotificationsProvider>
  );
}

export default App;
```

> **Key Points:**
> - `createAppHost()` no longer needs a context parameter
> - Each service has its own provider wrapping the plugin system
> - Plugins access services via hooks (`useNotifications()`, `useRouter()`, etc.)
> - The plugin host is passed to `AppPluginProvider`
> - Slot providers wrap the areas where plugins can inject content
import { createAppContext } from './services/context.js';
import { NotificationService } from './services/notifications.js';

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Services
  const [notificationService] = useState(() => new NotificationService());
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    return notificationService.subscribe(setNotifications);
  }, [notificationService]);

  // Create context
  const appContext = useMemo(() => createAppContext(
    notificationService,
    navigate,
    () => location.pathname,
    {
      get: async (endpoint) => {
        const res = await fetch(`/api${endpoint}`);
        return res.json();
      },
      post: async (endpoint, data) => {
        const res = await fetch(`/api${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return res.json();
      },
    },
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' }
  ), [notificationService, navigate, location.pathname]);

  // Create plugin host (v0.2.0)
  const [host] = useState(() => createAppHost(appContext));

  // Load plugins
  useEffect(() => {
    async function loadPlugins() {
      await host.add(() => import('./plugins/hello-plugin.js'), { enabled: true });
      await host.add(() => import('./plugins/dashboard-plugin.js'), { enabled: true });
    }
    loadPlugins();
  }, [host]);

  return (
    <PluginProvider manager={host} context={appContext}>
      <AppLayoutProvider>
        <ToolbarSlotProvider>
          <SidebarSlotProvider>
            <DashboardSlotProvider>
              <AppLayout />
              
              {/* Notifications */}
              <div className="notifications">
                {notifications.map(n => (
                  <div key={n.id} className={`notification ${n.type}`}>
                    {n.message}
                  </div>
                ))}
              </div>
            </DashboardSlotProvider>
          </SidebarSlotProvider>
        </ToolbarSlotProvider>
      </AppLayoutProvider>
    </PluginProvider>
  );
};

// Layout component that uses layout slots
const AppLayout = () => {
  return (
    <div className="app">
      {/* Header - gets toolbar from context via useAppLayout() */}
      <AppHeader />

      <div className="layout">
        {/* Sidebar - gets sidebar items from context via useAppLayout() */}
        <AppSidebar />
        
        {/* Main content - gets dashboard widgets from context via useAppLayout() */}
        <main>
          <AppDashboard />
        </main>
      </div>
    </div>
  );
};

export default App;
```

> **Important:** The slot providers (`ToolbarSlotProvider`, etc.) must wrap the parts of your app where those slots are rendered. This allows plugins to use slot Items (like `<ToolbarItem>`) to register content that appears in the correct place. The layout slot components (`AppHeader`, `AppSidebar`, `AppDashboard`) internally use `useAppLayout()` to retrieve the content from the context.

## Writing Your First Plugin

Now plugin developers can create plugins using your SDK:

```tsx
// plugins/hello-plugin/src/index.tsx
import { definePlugin } from 'my-app-sdk';
import { ToolbarItem, useNotifications, useLogger } from 'my-app-sdk/react';

/**
 * A simple Hello World plugin
 */
export default definePlugin({
  meta: {
    id: 'com.example.hello',
    name: 'Hello World Plugin',
    version: '1.0.0',
    description: 'A simple greeting plugin',
  },

  activate(infra) {
    // Called when the plugin is enabled
    // infra contains: host, _resources, _pluginId
    console.log('[HelloPlugin] Activated!');
    // Note: Can't use React hooks in activate()
    // Use hook-based side effects in components instead
  },

  deactivate() {
    // Called when the plugin is disabled
    console.log('[HelloPlugin] Deactivated!');
  },

  entrypoint: () => (
    <ToolbarItem>
      <HelloButton />
    </ToolbarItem>
  ),
});

// Components can use service hooks
const HelloButton = () => {
  const notifications = useNotifications();
  const logger = useLogger();
  
  return (
    <button onClick={() => {
      notifications.show('Hello from the plugin!', 'info');
      logger.log('Hello button clicked');
    }}>
      👋 Hello
    </button>
  );
};
```

> **Key Points:**
> - Plugins receive `PluginInfrastructure` (not full app context) in `activate()`
> - Components use service hooks: `useNotifications()`, `useRouter()`, `useUser()`, `useLogger()`
> - Each plugin only imports the hooks it needs
> - Services are optional - plugins can work without them

## Building Plugins

### Development Mode

During development, you can use the plugin directly without building:

```tsx
// In your app during development
await host.add(() => import('./plugins/hello-plugin/src/index.tsx'), { enabled: true });
```

### Production Build

For production, use the SDK build tool:

```typescript
// plugins/hello-plugin/build.ts
import { buildPlugin } from '@react-pkl/sdk';

await buildPlugin({
  entry: './src/index.tsx',
  outDir: './dist',
  meta: {
    id: 'com.example.hello',
    name: 'Hello World Plugin',
    version: '1.0.0',
  },
  formats: ['esm'],
  minify: true,
  sourcemap: true,
});

console.log('Plugin built successfully!');
```

Run it:

```bash
node build.ts
```

The plugin will be bundled to `dist/index.js` and can be loaded:

```tsx
await host.add(() => import('/plugins/hello-plugin/dist/index.js'), { enabled: true });
```

## Next Steps

Now that you have a working plugin system:

1. **Add More Features** - Expand your `AppContext` with more services
2. **Create More Slots** - Define additional extension points
3. **Resource Management** - Implement automatic cleanup for routes, timers, etc.
4. **Remote Plugins** - Set up a plugin manifest server for client mode
5. **Plugin Marketplace** - Build a UI for managing plugins
6. **Documentation** - Document your SDK for plugin developers

Check out these guides:
- [API Reference](./API.md)
- [Advanced Usage](./ADVANCED.md)
- [Examples](../examples/)

## Common Patterns

### Lazy Loading Plugins

```typescript
const pluginsToLoad = ['plugin-a', 'plugin-b', 'plugin-c'];

for (const pluginId of pluginsToLoad) {
  await host.add(
    () => import(`./plugins/${pluginId}.js`),
    { enabled: true }
  );
}
```

### Conditional Plugin Loading

```typescript
// Only load admin plugins for admin users
if (user.role === 'admin') {
  await host.add(() => import('./plugins/admin-panel.js'), { enabled: true });
}

// Only load on certain routes
if (location.pathname.startsWith('/dashboard')) {
  await host.add(() => import('./plugins/dashboard-widgets.js'), { enabled: true });
}
```

### Plugin with Custom Settings UI

If you want plugins to have configurable settings, you can use the `SettingsItem` slot:

```typescript
import { definePlugin, SettingsItem, useAppContext } from 'my-app-sdk';

export default definePlugin({
  meta: {
    id: 'com.example.configurable',
    name: 'Configurable Plugin',
    version: '1.0.0',
  },

  entrypoint: () => (
    <SettingsItem>
      <PluginSettingsPanel />
    </SettingsItem>
  ),
});

function PluginSettingsPanel() {
  const context = useAppContext();
  const [apiKey, setApiKey] = useState('');

  const handleSave = async () => {
    // You could save settings via your app's API
    await context.api.post('/plugin-settings/com.example.configurable', { apiKey });
    context.notifications.show('Settings saved!', 'success');
  };

  return (
    <div className="plugin-settings">
      <h3>Plugin Settings</h3>
      <input
        type="text"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="API Key"
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

## Troubleshooting

### Plugin Not Loading

1. Check the browser console for errors
2. Verify the plugin ID is unique
3. Ensure all peer dependencies are installed
4. Check that the plugin exports a default module

### Slot Content Not Rendering

1. Verify slot Items are wrapped in the correct slot Provider
2. Ensure the plugin is enabled: `host.getEnabled()`
3. Check that slot Providers wrap the layout components that render the content
4. Verify layout slot components use `useAppLayout()` to retrieve content

### Type Errors

1. Ensure your SDK properly exports types
2. Plugin developers need to import types from your SDK, not `@react-pkl/core`
3. Check `tsconfig.json` has proper module resolution

### Context Not Available

1. Verify context is passed to `PluginHost` (v0.2.0) when creating it with `createAppHost(context)`
2. Check that `activate` signature matches: `activate(context: AppContext)`
3. Make sure context is set before plugins are enabled
4. Ensure `PluginProvider` receives both `manager` and `context` props
