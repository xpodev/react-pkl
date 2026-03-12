---
sidebar_position: 6
title: Advanced Usage
---

# Advanced Usage Guide

This guide covers advanced patterns and techniques for building sophisticated plugin systems with React PKL.

## Table of Contents

1. [Automatic Resource Cleanup](#automatic-resource-cleanup)
2. [Dynamic Route Registration](#dynamic-route-registration)
3. [Event System](#event-system)
4. [Plugin Communication](#plugin-communication)
5. [Client Mode & Remote Plugins](#client-mode--remote-plugins)
6. [Plugin Lifecycle Management](#plugin-lifecycle-management)
7. [Performance Optimization](#performance-optimization)
8. [Security Considerations](#security-considerations)
9. [Testing Plugins](#testing-plugins)
10. [Advanced TypeScript Patterns](#advanced-typescript-patterns)

---

## Automatic Resource Cleanup

One of React PKL's most powerful features is automatic resource cleanup. When a plugin is disabled, all registered resources are automatically cleaned up.

### Implementing Cleanup in Your SDK

```typescript
// my-sdk/src/router-service.ts
import type { ResourceTracker } from '@pkl.js/react';

export class RouterService {
  private routes = new Map<string, Route>();
  private resources?: ResourceTracker;
  private currentPluginId?: string;

  constructor(
    private navigate: (path: string) => void,
    private onRouteChange: () => void
  ) {}

  // Internal: Called by plugin manager
  _setResourceContext(resources: ResourceTracker, pluginId: string) {
    this.resources = resources;
    this.currentPluginId = pluginId;
  }

  registerRoute(route: Route): void {
    this.routes.set(route.path, route);
    this.onRouteChange();

    // Register cleanup function
    if (this.resources && this.currentPluginId) {
      this.resources.register(this.currentPluginId, () => {
        this.routes.delete(route.path);
        this.onRouteChange();
      });
    }
  }

  unregisterRoute(path: string): void {
    this.routes.delete(path);
    this.onRouteChange();
  }

  getRoutes(): Route[] {
    return Array.from(this.routes.values());
  }
}
```

### Context Integration

Wire up the resource tracker in your context:

```typescript
// my-sdk/src/app-context.ts
export function createAppContext(services: Services): AppContext {
  const context: AppContext = {
    router: services.router,
    notifications: services.notifications,
    // ... other services
  };

  return new Proxy(context, {
    get(target, prop) {
      // Special handling for _resources and _currentPluginId
      if (prop === '_resources' || prop === '_currentPluginId') {
        return target[prop];
      }

      const value = target[prop];
      
      // If it's a service, inject resource context
      if (value && typeof value === 'object') {
        if ('_setResourceContext' in value) {
          const resources = target._resources;
          const pluginId = target._currentPluginId;
          if (resources && pluginId) {
            value._setResourceContext(resources, pluginId);
          }
        }
      }

      return value;
    },
  });
}
```

### What Can Be Auto-Cleaned

Any resource can be tracked:

```typescript
export default definePlugin({
  activate(context) {
    // Routes
    context.router.registerRoute({ path: '/my-page', component: MyPage });

    // Event listeners
    const handler = () => console.log('resize');
    window.addEventListener('resize', handler);
    if (context._resources && context._currentPluginId) {
      context._resources.register(context._currentPluginId, () => {
        window.removeEventListener('resize', handler);
      });
    }

    // Timers
    const interval = setInterval(() => console.log('tick'), 1000);
    if (context._resources && context._currentPluginId) {
      context._resources.register(context._currentPluginId, () => {
        clearInterval(interval);
      });
    }

    // WebSocket connections
    const ws = new WebSocket('wss://example.com');
    if (context._resources && context._currentPluginId) {
      context._resources.register(context._currentPluginId, () => {
        ws.close();
      });
    }
  },
  
  // No need for manual cleanup in deactivate!
  // Everything is automatically cleaned up when disabled
});
```

### Helper Function

Create a helper for plugin developers:

```typescript
// my-sdk/src/plugin-helpers.ts
import type { AppContext } from './app-context.js';

export function onCleanup(context: AppContext, cleanup: () => void): void {
  if (context._resources && context._currentPluginId) {
    context._resources.register(context._currentPluginId, cleanup);
  }
}

// Usage in plugins
export default definePlugin({
  activate(context) {
    const ws = new WebSocket('wss://example.com');
    onCleanup(context, () => ws.close());

    const interval = setInterval(() => {}, 1000);
    onCleanup(context, () => clearInterval(interval));
  },
});
```

---

## Dynamic Route Registration

Enable plugins to add entirely new pages to your application.

### SDK Implementation

```typescript
// my-sdk/src/app-context.ts
export interface PluginRoute {
  path: string;
  component: React.ComponentType;
  label?: string;
  icon?: React.ReactNode;
  exact?: boolean;
}

export interface RouterService {
  navigate(path: string): void;
  registerRoute(route: PluginRoute): void;
  getRoutes(): PluginRoute[];
}
```

### App Integration with React Router

```tsx
// app/src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

function App() {
  const [routes, setRoutes] = useState<PluginRoute[]>([]);
  const routerService = {
    navigate: useNavigate(),
    registerRoute: (route) => {
      setRoutes(prev => [...prev, route]);
      // Auto-cleanup will remove it later
    },
    getRoutes: () => routes,
  };

  return (
    <Routes>
      {/* Built-in routes */}
      <Route path="/" element={<Home />} />
      <Route path="/settings" element={<Settings />} />

      {/* Plugin routes */}
      {routes.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={<route.component />}
        />
      ))}
    </Routes>
  );
}
```

### Plugin Usage

```tsx
export default definePlugin({
  activate(context) {
    context.router.registerRoute({
      path: '/my-plugin-page',
      component: MyPluginPage,
      label: 'My Page',
      icon: <CustomIcon />,
    });
  },
});

function MyPluginPage() {
  const context = useAppContext();
  return (
    <div>
      <h1>My Plugin Page</h1>
      <button onClick={() => context.router.navigate('/')}>
        Go Home
      </button>
    </div>
  );
}
```

---

## Event System

Enable communication between your app and plugins through events.

### SDK EventBus Implementation

```typescript
// my-sdk/src/event-bus.ts
type EventHandler<T = any> = (data: T) => void;

export class EventBus {
  private listeners = new Map<string, Set<EventHandler>>();

  on<T = any>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  off<T = any>(event: string, handler: EventHandler<T>): void {
    this.listeners.get(event)?.delete(handler);
  }

  emit<T = any>(event: string, data: T): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  once<T = any>(event: string, handler: EventHandler<T>): () => void {
    const wrappedHandler = (data: T) => {
      handler(data);
      this.off(event, wrappedHandler);
    };
    return this.on(event, wrappedHandler);
  }
}

// Add to AppContext
export interface AppContext {
  events: EventBus;
  // ... other services
}
```

### Auto-Cleanup for Events

```typescript
// my-sdk/src/event-bus.ts
export class EventBus {
  // ... previous code

  onWithCleanup<T = any>(
    event: string,
    handler: EventHandler<T>,
    context: AppContext
  ): () => void {
    const unsubscribe = this.on(event, handler);
    
    if (context._resources && context._currentPluginId) {
      context._resources.register(context._currentPluginId, unsubscribe);
    }
    
    return unsubscribe;
  }
}
```

### Plugin Usage

```tsx
export default definePlugin({
  activate(context) {
    // Listen for events
    context.events.on('user-updated', (user) => {
      console.log('User updated:', user);
      context.notifications.show(`Welcome, ${user.name}!`);
    });

    // Or with auto-cleanup
    context.events.onWithCleanup('theme-changed', (theme) => {
      console.log('New theme:', theme);
    }, context);

    // Emit events
    context.events.emit('plugin-ready', { 
      pluginId: 'my-plugin',
      version: '1.0.0'
    });
  },
});
```

---

## Plugin Communication

Enable plugins to communicate with each other.

### Plugin Registry Access

```typescript
// my-sdk/src/plugin-service.ts
export interface PluginService {
  /**
   * Check if a plugin is enabled
   */
  isEnabled(pluginId: string): boolean;

  /**
   * Get plugin metadata
   */
  getPlugin(pluginId: string): PluginMeta | undefined;

  /**
   * Call a method on another plugin (if exposed)
   */
  call<T = any>(pluginId: string, method: string, ...args: any[]): T | undefined;
}
```

### Shared API Pattern

```typescript
// Plugin A exports an API
export default definePlugin({
  meta: { id: 'plugin-a', /* ... */ },
  
  activate(context) {
    // Register API in context
    (context as any).pluginAPIs = (context as any).pluginAPIs || {};
    (context as any).pluginAPIs['plugin-a'] = {
      getData: () => ['item1', 'item2'],
      processItem: (item: string) => item.toUpperCase(),
    };
  },
});

// Plugin B uses Plugin A's API
export default definePlugin({
  meta: { id: 'plugin-b', /* ... */ },
  
  activate(context) {
    const pluginAApi = (context as any).pluginAPIs?.['plugin-a'];
    if (pluginAApi) {
      const data = pluginAApi.getData();
      console.log('Data from Plugin A:', data);
    }
  },
});
```

### Event-Based Communication

```typescript
// Plugin A listens for requests
export default definePlugin({
  activate(context) {
    context.events.on('request-data', (requestId) => {
      const data = fetchMyData();
      context.events.emit('data-response', { requestId, data });
    });
  },
});

// Plugin B requests data
export default definePlugin({
  activate(context) {
    const requestId = Math.random().toString();
    
    context.events.once('data-response', (response) => {
      if (response.requestId === requestId) {
        console.log('Got data:', response.data);
      }
    });
    
    context.events.emit('request-data', requestId);
  },
});
```

---

## Client Mode & Remote Plugins

Fetch plugins from a remote server.

### Server-Side Manifest

```typescript
// server/routes/plugins.ts
import express from 'express';

const router = express.Router();

// Plugin manifest endpoint
router.get('/manifest', (req, res) => {
  const manifest = [
    {
      meta: {
        id: 'com.example.plugin1',
        name: 'Plugin 1',
        version: '1.0.0',
        description: 'First plugin',
      },
      url: 'https://cdn.example.com/plugins/plugin1/index.js',
    },
    {
      meta: {
        id: 'com.example.plugin2',
        name: 'Plugin 2',
        version: '2.1.0',
      },
      url: 'https://cdn.example.com/plugins/plugin2/index.js',
    },
  ];

  // Filter by user permissions
  const allowedPlugins = manifest.filter(plugin => 
    userHasAccess(req.user, plugin.meta.id)
  );

  res.json(allowedPlugins);
});

export default router;
```

### Client-Side Integration

```tsx
// app/src/App.tsx
import { PluginClient } from '@pkl.js/react';
import { PluginProvider } from '@pkl.js/react/react';

function App() {
  const [client] = useState(() => 
    new PluginClient({
      manifestUrl: 'https://api.example.com/plugins/manifest',
      context: appContext,
      fetch: customFetch, // Optional: add auth headers
    })
  );

  useEffect(() => {
    client.sync().then(() => {
      console.log('Plugins loaded:', client.getAll());
    });
  }, []);

  return (
    <PluginProvider registry={client.registry}>
      <AppContent />
    </PluginProvider>
  );
}
```

### Periodic Sync

```tsx
useEffect(() => {
  // Sync every 5 minutes
  const interval = setInterval(() => {
    client.sync();
  }, 5 * 60 * 1000);

  return () => clearInterval(interval);
}, [client]);
```

### Custom Fetch with Auth

```typescript
const client = new PluginClient({
  manifestUrl: 'https://api.example.com/plugins/manifest',
  context: appContext,
  fetch: async (url, options) => {
    const token = await getAuthToken();
    return fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  },
});
```

---

## Plugin Lifecycle Management

Advanced patterns for managing plugin lifecycles.

### Dependency Management

```typescript
// my-sdk/src/plugin-dependencies.ts
export interface PluginWithDeps extends PluginModule<AppContext> {
  meta: PluginMeta & {
    dependencies?: string[];
  };
}

export async function loadPluginWithDeps(
  manager: PluginManager<AppContext>,
  plugin: PluginWithDeps,
  allPlugins: Map<string, PluginWithDeps>
): Promise<void> {
  const deps = plugin.meta.dependencies || [];
  
  // Load dependencies first
  for (const depId of deps) {
    const dep = allPlugins.get(depId);
    if (!dep) {
      throw new Error(`Dependency not found: ${depId}`);
    }
    
    if (!manager.registry.has(depId)) {
      await loadPluginWithDeps(manager, dep, allPlugins);
    }
  }
  
  // Then load this plugin
  await manager.add(plugin, { enabled: true });
}
```

### Version Compatibility

```typescript
import semver from 'semver';

export function checkCompatibility(
  plugin: PluginModule,
  sdkVersion: string
): boolean {
  const requiredVersion = (plugin.meta as any).sdkVersion;
  if (!requiredVersion) return true;
  
  return semver.satisfies(sdkVersion, requiredVersion);
}

// Usage
if (!checkCompatibility(plugin, '1.2.0')) {
  console.error(`Plugin ${plugin.meta.name} requires SDK version ${plugin.meta.sdkVersion}`);
}
```

### Hot Reload

```typescript
export class HotReloadManager {
  constructor(private manager: PluginManager) {}

  async reload(pluginId: string, newLoader: PluginLoader): Promise<void> {
    // Disable and remove old version
    await this.manager.disable(pluginId);
    await this.manager.remove(pluginId);

    // Add and enable new version
    await this.manager.add(newLoader, { enabled: true });
  }
}

// Usage in development
if (import.meta.hot) {
  import.meta.hot.accept('./my-plugin.js', (newModule) => {
    hotReloadManager.reload('my-plugin', () => newModule.default);
  });
}
```

---

## Performance Optimization

### Code Splitting

```typescript
// Lazy load plugins only when needed
const adminPlugins = [
  { id: 'admin-dashboard', loader: () => import('./plugins/admin-dashboard.js') },
  { id: 'user-management', loader: () => import('./plugins/user-management.js') },
];

// Load only when user navigates to admin section
if (location.pathname.startsWith('/admin')) {
  for (const plugin of adminPlugins) {
    await manager.add(plugin.loader, { enabled: true });
  }
}
```

### Memoized Slot Components

```tsx
import { memo } from 'react';

export const PluginSlotMemo = memo(PluginSlot, (prev, next) => {
  return prev.name === next.name && 
         shallowEqual(prev.componentProps, next.componentProps);
});
```

### Batch Updates

```typescript
// Load multiple plugins in parallel
await Promise.all([
  manager.add(() => import('./plugin1.js'), { enabled: false }),
  manager.add(() => import('./plugin2.js'), { enabled: false }),
  manager.add(() => import('./plugin3.js'), { enabled: false }),
]);

// Then enable them (triggers UI update once)
await Promise.all([
  manager.enable('plugin1'),
  manager.enable('plugin2'),
  manager.enable('plugin3'),
]);
```

---

## Security Considerations

### Content Security Policy

```html
<!-- Allow loading plugins from trusted CDN -->
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' https://cdn.example.com;">
```

### Plugin Sandboxing

```typescript
// Create isolated context for each plugin
const sandboxedContext = new Proxy(baseContext, {
  get(target, prop) {
    // Block access to sensitive APIs
    if (prop === 'admin' || prop === '_internal') {
      throw new Error('Access denied');
    }
    return target[prop];
  },
});

await manager.add(untrustedPlugin, { enabled: true });
```

### Permission System

```typescript
interface PluginPermissions {
  canAccessAPI: boolean;
  canModifyUI: boolean;
  canAccessUserData: boolean;
}

export function createRestrictedContext(
  baseContext: AppContext,
  permissions: PluginPermissions
): AppContext {
  return {
    ...baseContext,
    api: permissions.canAccessAPI ? baseContext.api : undefined,
    user: permissions.canAccessUserData ? baseContext.user : null,
  };
}
```

---

## Testing Plugins

### Unit Testing

```typescript
// my-plugin.test.ts
import { describe, it, expect, vi } from 'vitest';
import plugin from './my-plugin.js';

describe('MyPlugin', () => {
  it('should activate successfully', async () => {
    const mockContext = {
      notifications: { show: vi.fn() },
      router: { navigate: vi.fn() },
    };

    await plugin.activate!(mockContext as any);

    expect(mockContext.notifications.show).toHaveBeenCalledWith(
      expect.stringContaining('activated'),
      'success'
    );
  });

  it('should register routes', async () => {
    const mockContext = {
      router: { registerRoute: vi.fn() },
    };

    await plugin.activate!(mockContext as any);

    expect(mockContext.router.registerRoute).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/my-page' })
    );
  });
});
```

### Integration Testing

```tsx
// integration.test.tsx
import { render, screen } from '@testing-library/react';
import { PluginProvider, PluginSlot } from '@pkl.js/react/react';
import { PluginManager } from '@pkl.js/react';
import myPlugin from './my-plugin.js';

describe('Plugin Integration', () => {
  it('should render plugin components', async () => {
    const manager = new PluginManager();
    await manager.add(myPlugin, { enabled: true });

    render(
      <PluginProvider registry={manager.registry}>
        <PluginSlot name="toolbar" />
      </PluginProvider>
    );

    expect(screen.getByText(/my plugin/i)).toBeInTheDocument();
  });
});
```

---

## Advanced TypeScript Patterns

### Typed Slots

```typescript
// my-sdk/src/slots.ts
import type { ComponentType } from 'react';

export interface SlotProps {
  toolbar: { compact?: boolean };
  sidebar: { collapsed?: boolean };
  content: { maxWidth?: number };
}

export type SlotComponents = {
  [K in keyof SlotProps]?: ComponentType<SlotProps[K]>;
};

// Use in plugin definition
export default definePlugin({
  components: {
    toolbar: ({ compact }) => <div>{/* ... */}</div>,
    sidebar: ({ collapsed }) => <div>{/* ... */}</div>,
  } satisfies SlotComponents,
});
```

### Context with Type Guards

```typescript
export function createSecureContext<T extends AppContext>(
  context: T,
  pluginId: string
): T {
  return new Proxy(context, {
    get(target, prop) {
      if (prop === '_internal' && !isSystemPlugin(pluginId)) {
        throw new Error('Access denied');
      }
      return target[prop];
    },
  }) as T;
}
```

### Generic Plugin Builder

```typescript
export function createPluginBuilder<TContext>() {
  return function definePlugin(
    plugin: PluginModule<TContext>
  ): PluginModule<TContext> {
    return plugin;
  };
}

// Usage
const defineMyAppPlugin = createPluginBuilder<MyAppContext>();
export default defineMyAppPlugin({ /* ... */ });
```
