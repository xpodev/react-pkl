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

### Step 2: Define Available Slots

Slots are extension points where plugins can inject UI components:

```typescript
// my-app-sdk/src/slots.ts

/**
 * Available slots in your application where plugins can add components.
 */
export const APP_SLOTS = {
  /** Toolbar at the top of the app */
  TOOLBAR: 'toolbar',
  
  /** Left sidebar navigation */
  SIDEBAR: 'sidebar',
  
  /** Main content area */
  CONTENT: 'content',
  
  /** Settings page */
  SETTINGS: 'settings',
  
  /** Dashboard widgets */
  DASHBOARD: 'dashboard',
} as const;

export type AppSlot = typeof APP_SLOTS[keyof typeof APP_SLOTS];
```

### Step 3: Create SDK Helpers

Make it easy for plugin developers to use your SDK:

```typescript
// my-app-sdk/src/plugin.ts
import { PluginManager, PluginClient } from '@react-pkl/core';
import type { PluginModule } from '@react-pkl/core';
import type { AppContext } from './app-context.js';

// Type alias for your plugins
export type AppPlugin = PluginModule<AppContext>;

// Helper function for type inference
export function definePlugin(plugin: AppPlugin): AppPlugin {
  return plugin;
}

// Factory for creating the plugin manager
export function createAppManager(context: AppContext) {
  return new PluginManager<AppContext>(context);
}

// Factory for creating the plugin client
export function createAppClient(manifestUrl: string, context: AppContext) {
  return new PluginClient<AppContext>({
    manifestUrl,
    context,
  });
}
```

### Step 4: Create React Hooks

Provide React integration for your SDK:

```typescript
// my-app-sdk/src/react/index.ts
export { PluginProvider, PluginSlot } from '@react-pkl/core/react';
export {
  usePlugins,
  useEnabledPlugins,
  usePlugin,
  usePluginMeta,
  useSlotComponents,
} from '@react-pkl/core/react';

// Custom hook for your context
import { useContext, createContext } from 'react';
import type { AppContext } from '../app-context.js';

const AppContextReact = createContext<AppContext | null>(null);

export function AppContextProvider({ 
  context, 
  children 
}: { 
  context: AppContext; 
  children: React.ReactNode;
}) {
  return (
    <AppContextReact.Provider value={context}>
      {children}
    </AppContextReact.Provider>
  );
}

export function useAppContext(): AppContext {
  const context = useContext(AppContextReact);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
}
```

### Step 5: Export Everything

```typescript
// my-app-sdk/src/index.ts
export type { AppContext } from './app-context.js';
export { APP_SLOTS, type AppSlot } from './slots.js';
export { 
  definePlugin, 
  createAppManager, 
  createAppClient,
  type AppPlugin,
} from './plugin.js';

// Re-export for convenience
export type { PluginMeta } from '@react-pkl/core';
```

```typescript
// my-app-sdk/src/react/index.ts (separate export for React)
export * from './hooks.js'; // Your custom exports
```

### Step 6: Configure package.json

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
    "@react-pkl/core": "^0.1.0",
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

### Step 2: Set Up the Plugin Manager

```tsx
// app/src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { PluginProvider, PluginSlot, APP_SLOTS } from 'my-app-sdk/react';
import { createAppManager } from 'my-app-sdk';
import { createAppContext } from './services/context.js';
import { NotificationService } from './services/notifications.js';

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Services
  const [notificationService] = useState(() => new NotificationService());
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    return notificationService.subscribe(setNotifications);
  }, [notificationService]);

  // Create context
  const appContext = createAppContext(
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
  );

  // Create plugin manager
  const [manager] = useState(() => createAppManager(appContext));

  // Load plugins
  useEffect(() => {
    async function loadPlugins() {
      await manager.add(() => import('./plugins/hello-plugin.js'), { enabled: true });
      await manager.add(() => import('./plugins/dashboard-plugin.js'), { enabled: true });
    }
    loadPlugins();
  }, [manager]);

  return (
    <PluginProvider registry={manager.registry}>
      <div className="app">
        <header>
          <h1>My Application</h1>
          <div className="toolbar">
            <PluginSlot name={APP_SLOTS.TOOLBAR} />
          </div>
        </header>

        <div className="layout">
          <aside>
            <PluginSlot name={APP_SLOTS.SIDEBAR} />
          </aside>
          
          <main>
            <PluginSlot name={APP_SLOTS.CONTENT} />
          </main>
        </div>

        {/* Notifications */}
        <div className="notifications">
          {notifications.map(n => (
            <div key={n.id} className={`notification ${n.type}`}>
              {n.message}
            </div>
          ))}
        </div>
      </div>
    </PluginProvider>
  );
}

export default App;
```

## Writing Your First Plugin

Now plugin developers can create plugins using your SDK:

```tsx
// plugins/hello-plugin/src/index.tsx
import { definePlugin } from 'my-app-sdk';
import { useAppContext } from 'my-app-sdk/react';

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
    context.logger.log('[HelloPlugin] Activated!');
    context.notifications.show('Hello World Plugin is now active!', 'success');
  },

  deactivate() {
    // Called when the plugin is disabled
    console.log('[HelloPlugin] Deactivated!');
  },

  components: {
    // Add a button to the toolbar
    toolbar: HelloButton,
    
    // Add content to the main area
    content: HelloContent,
  },
});

// Components can use your SDK's hooks
function HelloButton() {
  const context = useAppContext();
  
  return (
    <button onClick={() => {
      context.notifications.show('Hello from the plugin!', 'info');
    }}>
      👋 Hello
    </button>
  );
}

function HelloContent() {
  const context = useAppContext();
  
  return (
    <div className="hello-content">
      <h2>Hello, {context.user?.name || 'Guest'}!</h2>
      <p>This content is provided by the Hello World plugin.</p>
    </div>
  );
}
```

## Building Plugins

### Development Mode

During development, you can use the plugin directly without building:

```tsx
// In your app during development
await manager.add(() => import('./plugins/hello-plugin/src/index.tsx'), { enabled: true });
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
await manager.add(() => import('/plugins/hello-plugin/dist/index.js'), { enabled: true });
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
  await manager.add(
    () => import(`./plugins/${pluginId}.js`),
    { enabled: true }
  );
}
```

### Conditional Plugin Loading

```typescript
// Only load admin plugins for admin users
if (user.role === 'admin') {
  await manager.add(() => import('./plugins/admin-panel.js'), { enabled: true });
}

// Only load on certain routes
if (location.pathname.startsWith('/dashboard')) {
  await manager.add(() => import('./plugins/dashboard-widgets.js'), { enabled: true });
}
```

### Plugin Settings

```typescript
export default definePlugin({
  meta: { /* ... */ },
  
  activate(context) {
    const settings = context.storage.get('plugin-settings') || {};
    // Use settings...
  },
  
  components: {
    settings: PluginSettings,
  },
});

function PluginSettings() {
  const [setting, setSetting] = useState('');
  
  const handleSave = () => {
    context.storage.set('plugin-settings', { setting });
  };
  
  return <div>{/* Settings UI */}</div>;
}
```

## Troubleshooting

### Plugin Not Loading

1. Check the browser console for errors
2. Verify the plugin ID is unique
3. Ensure all peer dependencies are installed
4. Check that the plugin exports a default module

### Components Not Rendering

1. Verify the slot name matches between app and plugin
2. Ensure the plugin is enabled: `manager.getEnabled()`
3. Check that `<PluginSlot>` is inside `<PluginProvider>`

### Type Errors

1. Ensure your SDK properly exports types
2. Plugin developers need to import types from your SDK, not `@react-pkl/core`
3. Check `tsconfig.json` has proper module resolution

### Context Not Available

1. Verify context is passed to `PluginManager` or `PluginClient`
2. Check that `activate` signature matches: `activate(context: AppContext)`
3. Make sure context is set before plugins are enabled
