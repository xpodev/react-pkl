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

### Step 1: Define Your Application Context

First, define what APIs and services you'll expose to plugins:

```typescript
// my-app-sdk/src/app-context.ts

/**
 * The context provided to all plugins when they activate.
 * This defines what your plugins can access.
 */
export interface AppContext {
  // Notification system
  notifications: {
    show(message: string, type?: 'info' | 'success' | 'warning' | 'error'): string;
    dismiss(id: string): void;
  };

  // Navigation/routing
  router: {
    navigate(path: string): void;
    getCurrentPath(): string;
  };

  // Data access
  api: {
    get<T>(endpoint: string): Promise<T>;
    post<T>(endpoint: string, data: unknown): Promise<T>;
  };

  // User info
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
  } | null;
}
```

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
import { PluginHost } from '@react-pkl/core';
import type { PluginModule } from '@react-pkl/core';
import type { AppContext } from './app-context.js';

// Type alias for your plugins
export type AppPlugin = PluginModule<AppContext>;

// Helper function for type inference
export function definePlugin(plugin: AppPlugin): AppPlugin {
  return plugin;
}

// Factory for creating the plugin host (v0.2.0)
export function createAppHost(context: AppContext) {
  return new PluginHost<AppContext>(context);
}
```

### Step 6: Create React Hooks and Context

Provide React integration with app-specific typed hooks:

```typescript
// my-app-sdk/src/react/app-context.ts
import { createContext, useContext } from 'react';
import type { AppContext } from '../app-context.js';

const AppReactContext = createContext<AppContext | null>(null);
AppReactContext.displayName = 'AppContext';

export { AppReactContext };

/**
 * Access the app context from inside any plugin component.
 * Must be used within the PluginProvider.
 */
export function useAppContext(): AppContext {
  const ctx = useContext(AppReactContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside PluginProvider with AppContext');
  }
  return ctx;
}
```

```typescript
// my-app-sdk/src/react/hooks.ts
import { createTypedHooks } from '@react-pkl/core/react';
import type { AppContext } from '../app-context.js';

// Re-export useAppContext
export { useAppContext } from './app-context.js';

// Create typed hooks for AppContext
export const {
  usePlugins: useAppPlugins,
  useEnabledPlugins: useEnabledAppPlugins,
  usePlugin: useAppPlugin,
  usePluginMeta: useAppPluginMeta,
  usePluginHost: useAppPluginHost,
  useCurrentPlugin: useCurrentAppPlugin,
} = createTypedHooks<AppContext>();
```

>**Note:** The `createTypedHooks<TContext>()` factory automatically creates typed wrappers for all plugin hooks, eliminating boilerplate and providing better type inference for plugin developers.

### Step 7: Export Everything

Create the main export files for your SDK:

```typescript
// my-app-sdk/src/index.ts - Main SDK exports
export type { AppContext, NotificationService, RouterService, LoggerService, UserInfo } from './app-context.js';
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
  type AppPluginLoader,
} from './plugin.js';

// Re-export for convenience
export type { PluginMeta } from '@react-pkl/core';
```

```typescript
// my-app-sdk/src/react/index.ts - React-specific exports
export { AppPluginProvider } from './provider.js';

export {
  useAppContext,
  useAppPlugin,
  useAppPluginMeta,
  useAppPlugins,
  useEnabledAppPlugins,
  useAppPluginHost,
  useCurrentAppPlugin,
} from './hooks.js';

// Re-export PluginEntrypoints for rendering plugin UI
export { PluginEntrypoints } from '@react-pkl/core/react';
```

> **Note:** The main `index.ts` exports types, contexts, slots, and helpers. The `react/index.ts` exports React-specific hooks and providers. This separation allows plugin developers to choose what they need.

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
    "@react-pkl/core": "^0.2.0",
    "react": ">=18.0.0"
  }
}
```

## Integrating with Your React App

### Step 1: Create Application Services

Implement the services defined in your `AppContext`:

```typescript
// app/src/services/notifications.ts
export class NotificationService {
  private listeners = new Set<(notifications: Notification[]) => void>();
  private notifications: Notification[] = [];

  show(message: string, type = 'info') {
    const id = Math.random().toString(36);
    this.notifications.push({ id, message, type });
    this.notify();
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => this.dismiss(id), 3000);
    return id;
  }

  dismiss(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.notifications));
  }
}
```

```typescript
// app/src/services/context.ts
import type { AppContext } from 'my-app-sdk';
import { NotificationService } from './notifications.js';

export function createAppContext(
  notificationService: NotificationService,
  navigate: (path: string) => void,
  getCurrentPath: () => string,
  api: AppContext['api'],
  user: AppContext['user']
): AppContext {
  return {
    notifications: {
      show: (msg, type) => notificationService.show(msg, type),
      dismiss: (id) => notificationService.dismiss(id),
    },
    router: {
      navigate,
      getCurrentPath,
    },
    api,
    user,
  };
}
```

### Step 2: Set Up the Plugin Host

```tsx
// app/src/App.tsx
import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { 
  PluginProvider,
  AppLayoutProvider,
  ToolbarSlotProvider,
  SidebarSlotProvider,
  DashboardSlotProvider,
  AppHeader,
  AppSidebar,
  AppDashboard,
} from 'my-app-sdk/react';
import { createAppHost } from 'my-app-sdk';
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
import { ToolbarItem, useAppContext } from 'my-app-sdk/react';

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

  activate(context) {
    // Called when the plugin is enabled
    console.log('[HelloPlugin] Activated!');
    context.notifications.show('Hello World Plugin is now active!', 'success');
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

// Components can use your SDK's hooks
const HelloButton = () => {
  const context = useAppContext();
  
  return (
    <button onClick={() => {
      context.notifications.show('Hello from the plugin!', 'info');
    }}>
      👋 Hello
    </button>
  );
};
```

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
