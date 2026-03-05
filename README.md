# React PKL

A **typesafe plugin system for React applications** written in TypeScript. React PKL allows you to extend React applications from external sources through a robust, type-safe plugin architecture.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61dafb.svg)](https://reactjs.org/)

## 🎯 Overview

React PKL is designed for **SDK developers** who want to create extensible React applications. It provides the foundation for building plugin systems where:

- Plugins can extend the UI through defined **slots**
- Plugins receive a **typesafe context** from the host application
- Resources are **automatically cleaned up** when plugins are disabled
- Plugins can be managed **locally** or fetched from a **remote source**

## 📦 Packages

### Core Package (`@react-pkl/core`)

The main plugin management system.

```bash
npm install @react-pkl/core
```

**Features:**
- `PluginManager` - Standalone mode with full plugin lifecycle control
- `PluginClient` - Client mode for remote plugin manifests
- `ResourceTracker` - Automatic resource cleanup
- React integration with hooks and components

### SDK Package (`@react-pkl/sdk`)

Build tools for creating and bundling plugins.

```bash
npm install @react-pkl/sdk --save-dev
```

**Features:**
- `buildPlugin()` - Bundle plugins with esbuild
- Metadata generation
- Multiple output formats (ESM, CJS)

## 🚀 Quick Start

### 1. Create Your SDK

First, define your application context and create an SDK for your plugin developers:

```typescript
// my-sdk/src/app-context.ts
export interface AppContext {
  notifications: {
    show(message: string, type?: 'info' | 'success' | 'error'): void;
  };
  router: {
    navigate(path: string): void;
  };
  user: { id: string; name: string } | null;
}

// my-sdk/src/index.ts
import { PluginManager } from '@react-pkl/core';
import type { AppContext } from './app-context.js';

export function createAppManager(context: AppContext) {
  return new PluginManager<AppContext>(context);
}

export { AppContext };
```

### 2. Integrate with Your React App

```tsx
// app/src/App.tsx
import { PluginProvider, PluginSlot } from '@react-pkl/core/react';
import { createAppManager } from 'my-sdk';

function App() {
  const manager = createAppManager({
    notifications: {
      show: (msg, type) => console.log(`[${type}] ${msg}`),
    },
    router: {
      navigate: (path) => window.location.href = path,
    },
    user: { id: '1', name: 'John Doe' },
  });

  // Load plugins
  useEffect(() => {
    manager.add(() => import('./plugins/hello-plugin.js'), { enabled: true });
  }, []);

  return (
    <PluginProvider registry={manager.registry}>
      <header>
        <h1>My App</h1>
        {/* Plugins can add components to this slot */}
        <PluginSlot name="toolbar" />
      </header>
      <main>
        <h2>Content</h2>
        <PluginSlot name="content" fallback={<p>No plugins loaded</p>} />
      </main>
    </PluginProvider>
  );
}
```

### 3. Create a Plugin

```tsx
// plugins/hello-plugin.tsx
import type { AppContext } from 'my-sdk';

export default {
  meta: {
    id: 'com.example.hello',
    name: 'Hello Plugin',
    version: '1.0.0',
    description: 'A simple greeting plugin',
  },

  activate(context: AppContext) {
    context.notifications.show('Hello Plugin activated!', 'success');
  },

  deactivate() {
    console.log('Goodbye!');
  },

  components: {
    toolbar: () => <button>Hello!</button>,
    content: () => <div>Hello from plugin!</div>,
  },
};
```

## 🏗️ Architecture

### Two Operation Modes

#### Standalone Mode

The application manages plugins directly with full control:

```typescript
import { PluginManager } from '@react-pkl/core';

const manager = new PluginManager(context);

// Add plugins
await manager.add(() => import('./my-plugin.js'), { enabled: true });

// Control lifecycle
await manager.enable('plugin-id');
await manager.disable('plugin-id');
await manager.remove('plugin-id');
```

#### Client Mode

The application fetches plugins from a remote manifest:

```typescript
import { PluginClient } from '@react-pkl/core';

const client = new PluginClient({
  manifestUrl: 'https://api.example.com/plugins',
  context: myAppContext,
});

// Sync plugins from server
await client.sync();
```

The manifest should return an array of plugin descriptors:

```json
[
  {
    "meta": {
      "id": "com.example.plugin",
      "name": "My Plugin",
      "version": "1.0.0"
    },
    "url": "https://cdn.example.com/plugins/my-plugin/index.js"
  }
]
```

### Resource Tracking

The `ResourceTracker` automatically cleans up plugin resources when they're disabled:

```typescript
// In your plugin's activate function
export default {
  activate(context: AppContext) {
    // Register a route
    context.router.registerRoute({
      path: '/my-page',
      component: MyPage,
    });
    
    // This will be automatically cleaned up when the plugin is disabled!
    // No need to manually track it in deactivate()
  },
};
```

To support this in your SDK:

```typescript
export interface AppContext {
  router: {
    registerRoute(route: Route): void;
  };
  _resources?: ResourceTracker;
  _currentPluginId?: string;
}

// In your SDK implementation
function registerRoute(route: Route) {
  routes.set(route.path, route);
  
  // Register cleanup function
  if (context._resources && context._currentPluginId) {
    context._resources.register(context._currentPluginId, () => {
      routes.delete(route.path);
    });
  }
}
```

## 🎣 React Hooks

### `usePlugins()`

Get all registered plugins:

```tsx
import { usePlugins } from '@react-pkl/core/react';

function PluginList() {
  const plugins = usePlugins();
  return (
    <ul>
      {plugins.map(entry => (
        <li key={entry.module.meta.id}>
          {entry.module.meta.name} - {entry.status}
        </li>
      ))}
    </ul>
  );
}
```

### `useEnabledPlugins()`

Get only enabled plugins:

```tsx
const enabledPlugins = useEnabledPlugins();
```

### `usePlugin(id)`

Get a specific plugin by ID:

```tsx
const plugin = usePlugin('com.example.hello');
```

### `usePluginMeta()`

Get metadata for all plugins:

```tsx
const metaList = usePluginMeta();
```

### `useSlotComponents(slot)`

Get all components registered for a slot:

```tsx
const toolbarComponents = useSlotComponents('toolbar');
```

## 🧩 Components

### `<PluginProvider>`

Wraps your application to provide plugin context:

```tsx
import { PluginProvider } from '@react-pkl/core/react';

<PluginProvider registry={manager.registry}>
  <App />
</PluginProvider>
```

### `<PluginSlot>`

Renders plugin components in a specific slot:

```tsx
import { PluginSlot } from '@react-pkl/core/react';

// Basic usage
<PluginSlot name="toolbar" />

// With fallback
<PluginSlot name="sidebar" fallback={<p>No plugins</p>} />

// With props passed to plugin components
<PluginSlot name="dashboard" componentProps={{ theme: 'dark' }} />
```

## 🔨 Building Plugins

Use the SDK package to bundle your plugins:

```typescript
// build.ts
import { buildPlugin } from '@react-pkl/sdk';

await buildPlugin({
  entry: './src/index.tsx',
  outDir: './dist',
  meta: {
    id: 'com.example.plugin',
    name: 'My Plugin',
    version: '1.0.0',
  },
  formats: ['esm'],
  minify: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
});
```

### Metadata Generation

Optionally generate custom metadata:

```typescript
await buildPlugin({
  entry: './src/index.tsx',
  outDir: './dist',
  meta: { id: 'my-plugin', name: 'My Plugin', version: '1.0.0' },
  generateMetadata: async (meta, outDir) => {
    return {
      ...meta,
      buildTime: new Date().toISOString(),
      hash: await computeHash(outDir),
    };
  },
  metadataFileName: 'plugin.json',
});
```

## 📚 Plugin API

### Plugin Module Interface

```typescript
interface PluginModule<TContext> {
  // Required metadata
  meta: {
    id: string;
    name: string;
    version: string;
    description?: string;
  };

  // Optional lifecycle hooks
  activate?(context: TContext): void | Promise<void>;
  deactivate?(): void | Promise<void>;

  // Optional React components by slot name
  components?: Record<string, ComponentType<any>>;
}
```

### TypeScript Plugin Helper

Create a helper for better type inference:

```typescript
// my-sdk/src/plugin.ts
import type { PluginModule } from '@react-pkl/core';
import type { AppContext } from './app-context.js';

export type AppPlugin = PluginModule<AppContext>;

export function definePlugin(plugin: AppPlugin): AppPlugin {
  return plugin;
}

// Usage in plugins
export default definePlugin({
  meta: { /* ... */ },
  activate(context) {
    // `context` is properly typed as AppContext!
    context.notifications.show('Hello!');
  },
});
```

## 🎨 Extension Points (Slots)

Slots are named extension points where plugins can inject components. Define slots in your SDK:

```typescript
// my-sdk/src/slots.ts
export const APP_SLOTS = {
  TOOLBAR: 'toolbar',
  SIDEBAR: 'sidebar',
  CONTENT: 'content',
  SETTINGS: 'settings',
} as const;

export type AppSlot = typeof APP_SLOTS[keyof typeof APP_SLOTS];
```

Then use them in your app:

```tsx
import { APP_SLOTS } from 'my-sdk';

<PluginSlot name={APP_SLOTS.TOOLBAR} />
```

## 🔒 Type Safety

React PKL is fully type-safe. Define your context once and get type checking everywhere:

```typescript
// SDK defines the context
export interface AppContext {
  api: {
    fetch<T>(path: string): Promise<T>;
  };
}

// Plugins get full type checking
export default definePlugin({
  async activate(context) {
    // TypeScript knows about `context.api.fetch`
    const data = await context.api.fetch<User[]>('/users');
    //    ^? User[]
  },
});
```

## 📖 Examples

The repository includes complete examples:

- **`examples/app`** - Host application with plugin integration
- **`examples/sdk`** - Custom SDK built on React PKL
- **`examples/plugins`** - Sample plugins demonstrating various features:
  - `hello-plugin` - Basic plugin with notification
  - `user-greeting-plugin` - Accesses app context
  - `theme-toggle-plugin` - State management
  - `custom-page-plugin` - Route registration with cleanup

## 🏛️ Design Philosophy

1. **Indirect Dependency** - Plugin developers use your SDK, not React PKL directly
2. **Type Safety First** - Everything is typed through generics
3. **Automatic Cleanup** - Resources are tracked and cleaned up automatically
4. **Flexibility** - Works in both standalone and client-server architectures
5. **React Native** - Provider/hook patterns for seamless integration

## 🛣️ Roadmap

- [ ] Add comprehensive test suite
- [ ] Error boundary integration
- [ ] Plugin sandboxing/isolation
- [ ] Hot module replacement support
- [ ] Performance monitoring
- [ ] Bundle size optimization
- [ ] CLI for scaffolding plugins
- [ ] Plugin marketplace template

## 🤝 Contributing

Contributions are welcome! This is a monorepo using npm workspaces.

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run example app
cd examples/app
npm run dev
```

## 📄 License

[Insert your license here]

## 🙏 Credits

Created for building extensible React applications with type safety and proper resource management.
