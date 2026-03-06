# React PKL

A **typesafe plugin system for React applications** written in TypeScript. React PKL allows you to extend React applications from external sources through a robust, type-safe plugin architecture with advanced theming support.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61dafb.svg)](https://reactjs.org/)

## 🎯 Overview

React PKL is designed for **SDK developers** who want to create extensible React applications. It provides the foundation for building plugin systems where:

- Plugins can extend the UI through defined **slots** and **layout overrides**
- Plugins receive a **typesafe context** from the host application
- **Theme plugins** can override entire layout components with custom styling
- **Static plugins** work without lifecycle management (perfect for themes)
- **Context-driven architecture** eliminates prop drilling with hooks
- **Style context** provides type-safe access to theme variables
- Resources are **automatically cleaned up** when plugins are disabled
- Everything is **fully type-safe** with TypeScript

## 📦 Packages

### Core Package (`@react-pkl/core`)

The main plugin management system.

```bash
npm install @react-pkl/core
```

**Features:**
- `PluginHost` - Central controller for plugins and themes
- Theme management with layout slot overrides
- React integration with hooks and components
- Automatic resource cleanup
- Type-safe context system

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
    registerRoute(route: { path: string; component: React.ComponentType }): () => void;
  };
  trackResource(cleanup: () => void): void;
  user: { id: string; name: string } | null;
}

// my-sdk/src/index.ts
import { PluginHost, createSlot } from '@react-pkl/core';
import type { AppContext } from './app-context.js';

export function createAppHost(context: AppContext) {
  return new PluginHost<AppContext>(context);
}

// Define slots for plugins to extend
export const ToolbarItem = createSlot('toolbar');
export const SidebarItem = createSlot('sidebar');

// Export layout components for theme overrides
export { AppHeader, AppSidebar } from './layout-slots.js';

export { AppContext };
export { useAppContext, useAppLayout, useStyles } from './hooks.js';
```

### 2. Integrate with Your React App

```tsx
// app/src/App.tsx
import { PluginProvider, LayoutProvider, Slot } from '@react-pkl/core/react';
import { createAppHost, AppHeader, AppSidebar } from 'my-sdk';
import { useAppLayoutSlot } from '@react-pkl/core/react';

function App() {
  const host = createAppHost({
    notifications: {
      show: (msg, type) => console.log(`[${type}] ${msg}`),
    },
    router: {
      navigate: (path) => window.location.href = path,
      registerRoute: (route) => {
        // Register route logic
        return () => { /* cleanup */ };
      },
    },
    trackResource: (cleanup) => host.trackResource(cleanup),
    user: { id: '1', name: 'John Doe' },
  });

  // Load plugins
  useEffect(() => {
    host.add(() => import('./plugins/hello-plugin.js'), { enabled: true });
    host.add(() => import('./plugins/dark-theme-plugin.js'));
  }, []);

  return (
    <PluginProvider host={host}>
      <LayoutProvider>
        <AppLayout />
      </LayoutProvider>
    </PluginProvider>
  );
}

function AppLayout() {
  // Get layout components (checks for theme overrides)
  const HeaderComponent = useAppLayoutSlot(AppHeader);
  const SidebarComponent = useAppLayoutSlot(AppSidebar);
  
  return (
    <div className="app">
      <HeaderComponent />
      <div className="content">
        <SidebarComponent />
        <main>
          <h2>Welcome</h2>
          <Slot name="content" fallback={<p>No plugins loaded</p>} />
        </main>
      </div>
    </div>
  );
}
```

### 3. Create a Standard Plugin

```tsx
// plugins/hello-plugin.tsx
import type { AppContext } from 'my-sdk';
import { ToolbarItem } from 'my-sdk';

export default {
  meta: {
    id: 'com.example.hello',
    name: 'Hello Plugin',
    version: '1.0.0',
    description: 'A simple greeting plugin',
  },

  activate(context: AppContext) {
    context.notifications.show('Hello Plugin activated!', 'success');
    
    // Register a route
    const unregister = context.router.registerRoute({
      path: '/hello',
      component: HelloPage
    });
    
    // Track for automatic cleanup
    context.trackResource(unregister);
  },

  deactivate() {
    console.log('Goodbye!');
  },

  entrypoint() {
    return <Toolbar Item>
      <button>Hello!</button>
    </ToolbarItem>;
  },
};
```

### 4. Create a Theme Plugin

```tsx
// plugins/dark-theme-plugin.tsx
import { AppHeader, AppSidebar, StyleProvider, useAppLayout, useAppContext } from 'my-sdk';

export default {
  meta: {
    id: 'com.example.dark-theme',
    name: 'Dark Theme',
    version: '1.0.0',
  },

  onThemeEnable(slots) {
    // Override layout components
    slots.set(AppHeader, DarkHeader);
    slots.set(AppSidebar, DarkSidebar);
    
    // Inject global styles
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --color-bg: #1a1a1a;
        --color-text: #e4e4e7;
      }
    `;
    document.head.appendChild(style);
    
    // Return cleanup function
    return () => {
      document.head.removeChild(style);
    };
  },

  onThemeDisable() {
    console.log('Dark theme disabled');
  },
};

function DarkHeader() {
  const { toolbar } = useAppLayout();
  const { user } = useAppContext();
  
  return (
    <StyleProvider variables={{ 
      bgPrimary: '#1a1a1a', 
      textPrimary: '#e4e4e7',
      accentColor: '#60a5fa'
    }}>
      <header style={{ background: '#18181b', color: '#e4e4e7' }}>
        <h1>My App</h1>
        <div>{user?.name}</div>
        <div className="toolbar">{toolbar}</div>
      </header>
    </StyleProvider>
  );
}

function DarkSidebar() {
  const { sidebar } = useAppLayout();
  
  return (
    <StyleProvider variables={{ sidebarBg: '#27272a' }}>
      <aside style={{ background: '#27272a' }}>
        {sidebar}
      </aside>
    </StyleProvider>
  );
}
```

## 🏗️ Architecture

### v0.2.0 Key Features

#### 1. Context-Driven Components

Components use hooks instead of props, eliminating prop drilling:

```tsx
// Old way (v0.1.0) - props everywhere
<AppHeader toolbar={toolbarItems} user={user} />

// New way (v0.2.0) - hooks
function AppHeader() {
  const { toolbar } = useAppLayout();  // Get layout content
  const { user } = useAppContext();    // Get app context
  return <header>...</header>;
}
```

#### 2. Theme System

Plugins can become themes that override entire layout components:

```typescript
export const darkTheme = {
  meta: { id: 'dark', name: 'Dark Theme', version: '1.0.0' },
  
  onThemeEnable(slots) {
    slots.set(AppHeader, DarkHeader);
    slots.set(AppSidebar, DarkSidebar);
    return () => { /* cleanup */ };
  },
  
  onThemeDisable() {
    // Additional cleanup
  }
};

// Activate theme
host.setThemePlugin(darkTheme);
```

#### 3. Style Context

Type-safe theme variables accessible via hooks:

```tsx
<StyleProvider variables={{ bgPrimary: '#000', textPrimary: '#fff' }}>
  <MyComponent />
</StyleProvider>

function MyComponent() {
  const styles = useStyles();
  return <div style={{ background: styles.bgPrimary }}>...</div>;
}
```

#### 4. Static Plugins

Plugins without lifecycle methods are always available:

```typescript
export const toolbar = {
  meta: { id: 'toolbar', name: 'Toolbar', version: '1.0.0' },
  entrypoint: () => <ToolbarButton />
};
```

#### 5. Automatic Resource Cleanup

Track resources for automatic cleanup on plugin disable:

```typescript
activate(context) {
  const unregister = context.router.registerRoute({/*...*/});
  context.trackResource(unregister); // Auto cleanup
  
  const handler = () => {};
  window.addEventListener('resize', handler);
  context.trackResource(() => window.removeEventListener('resize', handler));
}
```

### Plugin Lifecycle

```
┌─────────┐
│ Added   │
└────┬────┘
     │ enable()
     ▼
┌─────────┐ ◄──┐
│ Enabled │    │
└────┬────┘    │ disable()
     │         │
     │ remove()│
     ▼         │
┌─────────┐    │
│Disabled ├────┘
└─────────┘

Special:
- Static plugins: always "Enabled"
- Theme plugins: set via host.setThemePlugin()
```

##  Features

### ✅ Type Safety

Everything is generic over your context type:

```typescript
interface AppContext {
  router: RouterService;
  user: User | null;
}

const host = new PluginHost<AppContext>(context);

// Plugins get full type checking
export default {
  activate(context: AppContext) {
    context.router.navigate('/');  // ✓ Type-safe
    context.invalid.method();      // ✗ Type error
  }
};
```

### ✅ Extensibility Through Slots

Define extension points where plugins can add UI:

```tsx
// In your SDK
export const ToolbarItem = createSlot('toolbar');
export const SidebarItem = createSlot('sidebar');

// In your app
<header>
  <Slot name="toolbar" />
</header>

// In plugins
entrypoint() {
  return <ToolbarItem><button>My Button</button></ToolbarItem>;
}
```

### ✅ Layout Overrides

Theme plugins can replace entire layout components:

```tsx
// Default layout
export function AppHeader() {
  const { toolbar } = useAppLayout();
  return <header>{toolbar}</header>;
}

// Theme override
onThemeEnable(slots) {
  function CustomHeader() {
    const { toolbar } = useAppLayout();
    return <header className="dark">{toolbar}</header>;
  }
  slots.set(AppHeader, CustomHeader);
}

// In app - automatically uses theme override
<LayoutSlot default={AppHeader} />
```

### ✅ Style Variables

Cascading theme variables with TypeScript support:

```tsx
interface StyleVariables {
  bgPrimary: string;
  textPrimary: string;
  accentColor: string;
  // ... 9 more variables
}

<StyleProvider variables={{ bgPrimary: '#000' }}>
  <Component />  {/* bgPrimary = '#000', others = default */}
  <StyleProvider variables={{ accentColor: '#60a5fa' }}>
    <Child />  {/* bgPrimary = '#000', accentColor = '#60a5fa' */}
  </StyleProvider>
</StyleProvider>
```

### ✅ Automatic Cleanup

Resources are tracked and cleaned up automatically:

```typescript
activate(context) {
  // Register route
  const cleanup1 = context.router.registerRoute({/*...*/});
  context.trackResource(cleanup1);
  
  // Add event listener
  const handler = () => {};
  window.addEventListener('click', handler);
  context.trackResource(() => window.removeEventListener('click', handler));
  
  // All cleaned up automatically when plugin disabled
}
```

### ✅ Hot Reload Support

React Fast Refresh works seamlessly with the plugin system.

## 📚 Documentation

- **[Getting Started](./docs/GETTING_STARTED.md)** - Step-by-step tutorial
- **[API Reference](./docs/API.md)** - Complete API documentation
- **[Architecture](./docs/ARCHITECTURE.md)** - System design and data flow
- **[Theme System](./docs/THEME_SYSTEM.md)** - Theme plugin guide
- **[Examples](./docs/EXAMPLES.md)** - Example applications and plugins

## 🎨 Examples

The repository includes complete working examples:

### Example App
A full-featured application demonstrating the plugin system with:
- Multiple plugins (hello, user greeting, custom page, theme toggle)
- Dark theme plugin with layout overrides
- Plugin enable/disable UI
- Theme selector
- LocalStorage persistence

Run it:
```bash
cd examples/app
npm install
npm run dev
```

### Example Plugins
- **hello-plugin** - Simple toolbar button
- **user-greeting-plugin** - Dashboard widget
- **custom-page-plugin** - Adds a new page with routing
- **theme-toggle-plugin** - Settings button
- **dark-theme-plugin** - Complete dark theme with layout overrides

### Example SDK
A custom SDK showing how to:
- Define application context
- Create typed hooks (useAppContext, useAppLayout, useStyles)
- Define slots (ToolbarItem, SidebarItem, DashboardWidget)
- Create layout components (AppHeader, AppSidebar, AppDashboard)
- Export style context for theming

## 🔧 Build a Plugin

1. **Create plugin source**:
```tsx
// my-plugin/src/index.tsx
export default {
  meta: {
    id: 'com.example.my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
  },
  activate(context) {
    console.log('Activated!');
  },
  entrypoint: () => <div>Hello!</div>
};
```

2. **Build with SDK**:
```typescript
// my-plugin/build.ts
import { buildPlugin } from '@react-pkl/sdk';

await buildPlugin({
  entryPoint: 'src/index.tsx',
  outDir: 'dist',
  external: ['react', 'react-dom', 'my-sdk'],
});
```

3. **Load in app**:
```typescript
await host.add(() => import('./my-plugin/dist/index.js'), { enabled: true });
```

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## 📄 License

MIT © 2024

## 🔗 Links

- [Documentation](https://xpodev.github.io/react-pkl/)
- [Examples](./examples)
- [GitHub](https://github.com/xpodev/react-pkl)

---

**React PKL** - Build extensible React applications with type-safe plugins and themes.
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

## 🎨 Theme System

### Creating Theme Plugins

Theme plugins use `onThemeEnable()` and `onThemeDisable()` to manage theme lifecycle:

```typescript
import { definePlugin, AppHeader, AppSidebar, StyleProvider } from 'my-sdk';

const darkThemePlugin = definePlugin({
  meta: {
    id: 'com.example.dark-theme',
    name: 'Dark Theme',
    version: '1.0.0',
  },
  
  // Theme plugins don't need activate/deactivate (static plugins)
  // They only activate when set as the active theme
  
  onThemeEnable(slots) {
    // Apply CSS variables
    document.documentElement.style.setProperty('--bg-primary', '#1a1a1a');
    document.documentElement.style.setProperty('--text-primary', '#e4e4e7');
    
    // Override layout slots with themed components
    slots.set(AppHeader, DarkHeader);
    slots.set(AppSidebar, DarkSidebar);
    
    // Return cleanup function
    return () => {
      document.documentElement.style.removeProperty('--bg-primary');
      document.documentElement.style.removeProperty('--text-primary');
    };
  },
  
  onThemeDisable() {
    console.log('Theme disabled - additional cleanup');
  },
});

function DarkHeader({ toolbar }) {
  return (
    <StyleProvider variables={{
      bgPrimary: '#1a1a1a',
      textPrimary: '#e4e4e7',
      accentColor: '#60a5fa',
    }}>
      <header style={{ background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)' }}>
        {toolbar}
      </header>
    </StyleProvider>
  );
}
```

### Using StyleProvider

Provide type-safe style variables to components:

```tsx
import { StyleProvider, useStyles } from 'my-sdk';

function MyComponent() {
  const styles = useStyles();
  
  return (
    <div style={{
      background: styles.bgPrimary,
      color: styles.textPrimary,
      borderColor: styles.borderColor,
    }}>
      Themed content
    </div>
  );
}
```

### Setting Active Theme

```typescript
import { isThemePlugin } from '@react-pkl/core';

// Check if a plugin is a theme plugin
if (isThemePlugin(plugin)) {
  pluginHost.setThemePlugin(plugin);
}

// Get current theme
const currentTheme = pluginHost.getThemePlugin();

// Remove theme (back to default)
pluginHost.setThemePlugin(null);

// Persist theme in localStorage
localStorage.setItem('active-theme', plugin.meta.id);
```

### Static vs Dynamic Plugins

React PKL supports two plugin types:

```typescript
import { isStaticPlugin, isThemePlugin } from '@react-pkl/core';

// Static plugins - no activate/deactivate lifecycle
// Perfect for theme plugins that only need theme lifecycle
const themePlugin = {
  meta: { id: 'theme', name: 'Theme', version: '1.0.0' },
  onThemeEnable(slots) { /* ... */ },
  onThemeDisable() { /* ... */ },
};

isStaticPlugin(themePlugin); // true
isThemePlugin(themePlugin);  // true

// Dynamic plugins - full lifecycle management
const dataPlugin = {
  meta: { id: 'data', name: 'Data', version: '1.0.0' },
  async activate(context) { /* ... */ },
  async deactivate() { /* ... */ },
};

isStaticPlugin(dataPlugin); // false
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
  
  // Optional React entrypoint
  entrypoint?(): ReactNode;

  // Optional theme lifecycle hooks
  onThemeEnable?(slots: Map<Function, Function>): void | (() => void);
  onThemeDisable?(): void;
}
```

**Plugin Types:**
- **Dynamic Plugins**: Have `activate`/`deactivate` - Full lifecycle management
- **Static Plugins**: No `activate`/`deactivate` - Always available, perfect for themes
- **Theme Plugins**: Have `onThemeEnable`/`onThemeDisable` - Can be set as active theme
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
  - `theme-toggle-plugin` - State management with toolbar button
  - `custom-page-plugin` - Route registration with cleanup
  - `dark-theme-plugin` - Complete theme with layout overrides and style context

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
