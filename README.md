# React PKL

**A toolkit for building extensible React applications.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61dafb.svg)](https://reactjs.org/)

## 🎯 What is React PKL?

React PKL provides **primitives** for making React apps extensible through plugins. It doesn't prescribe how to structure your app - instead, it gives you low-level tools to build your own plugin system.

**Core Primitives:**
- **Layout Slots** - Components that can be overridden by theme plugins
- **Item Slots** - Extension points where plugins inject content
- **Plugin Registry** - Manage plugin lifecycle (load, enable, disable)
- **Resource Tracking** - Automatic cleanup when plugins unload
- **Plugin Loader** - Load plugins from bundles or manifests
- **Build Tools** - Bundle plugins with proper metadata

**Not included:** Opinions about your app architecture, service patterns, or state management.

## 📦 Installation

```bash
# Core plugin primitives
npm install @pkl.js/react

# Build tools for creating plugins (dev dependency)
npm install --save-dev @pkl.js/react-sdk
```

## 🧩 Core Concepts

### Layout Slots

Layout slots are components that can be replaced by theme plugins:

```typescript
import { createLayoutSlot } from '@pkl.js/react/react';

// Define a themeable header
const AppHeader = createLayoutSlot(() => {
  const layout = useAppLayout();
  return <header>{layout.toolbar}</header>;
});

// Theme plugins can override it
plugin.onThemeEnable(slots => {
  slots.set(AppHeader, () => <header className="dark">{/* custom */}</header>);
});
```

### Item Slots

Item slots let plugins inject content into specific areas:

```typescript
import { createLayoutContext, createSlot } from '@pkl.js/react/react';

// 1. Create layout context
const { LayoutProvider, useLayout, useLayoutController } = createLayoutContext();

// 2. Create slot for toolbar items
const { Provider: ToolbarProvider, Item: ToolbarItem } = createSlot(
  'toolbar',
  useLayoutController
);

// 3. App wraps in providers
<LayoutProvider>
  <ToolbarProvider>
    <Header /> {/* Renders toolbar items */}
  </ToolbarProvider>
</LayoutProvider>

// 4. Plugins add items
<ToolbarItem>
  <button>Plugin Button</button>
</ToolbarItem>
```

### Plugin Registry

Manage plugin lifecycle:

```typescript
import { PluginHost } from '@pkl.js/react';

// Minimal infrastructure context
const host = new PluginHost();

// Load plugins
await host.add(() => import('./my-plugin.js'), { enabled: true });

// Control plugins
await host.enable('plugin-id');
await host.disable('plugin-id');
await host.remove('plugin-id');
```

### Resource Tracking

Automatic cleanup when plugins unload:

```typescript
// In plugin activate()
activate(infra) {
  const interval = setInterval(() => {}, 1000);
  
  // Cleanup automatically when plugin disables
  infra._resources.track(() => clearInterval(interval));
}
```

## 💡 Build Your Own SDK

React PKL provides primitives - you decide how to compose them. Here's a minimal example:

```typescript
// 1. Define plugin shape
import { PluginHost, type PluginModule, type PluginInfrastructure } from '@pkl.js/react';

export interface MyAppPlugin extends PluginModule<PluginInfrastructure> {
  entrypoint?: () => React.ReactNode;
}

// 2. Create plugin registry
export function createPluginHost() {
  return new PluginHost<PluginInfrastructure>();
}

// 3. Define slots (optional - only if you want extensibility points)
import { createLayoutContext, createSlot } from '@pkl.js/react/react';

interface MyLayout {
  toolbar: React.ReactNode[];
  sidebar: React.ReactNode[];
}

const { LayoutProvider, useLayout, useLayoutController } = createLayoutContext<MyLayout>();

const { Provider: ToolbarProvider, Item: ToolbarItem } = createSlot<MyLayout, 'toolbar'>(
  'toolbar',
  useLayoutController
);

// 4. Export for plugins
export { ToolbarItem, LayoutProvider, ToolbarProvider, useLayout };

// 5. Define helper for plugin authors
export function definePlugin(plugin: MyAppPlugin): MyAppPlugin {
  return plugin;
}
```

**That's it.** The rest is up to you:
- Want app services? Use React contexts
- Want theming? Use `createLayoutSlot` and `host.setThemePlugin()`
- Want resource tracking? Use `infra._resources.track()`
- Want plugin loading? Use `host.add()` with import() or fetch()

See [examples/](examples/) for a complete SDK implementation.

## 📚 API Reference

### Core Exports

```typescript
import {
  // Plugin Management
  PluginHost,          // Registry + lifecycle management
  PluginRegistry,      // Just the registry
  PluginManager,       // Lifecycle without theme support
  PluginClient,        // Load plugins from remote manifests
  
  // Resource Tracking
  ResourceTracker,     // Per-plugin cleanup tracking
  
  // Types
  PluginInfrastructure,  // Minimal plugin context
  PluginModule,          // Plugin shape
  PluginMeta,            // Plugin metadata
  PluginEntry,           // Registry entry
  PluginLoader,          // Plugin factory type
} from '@pkl.js/react';
```

### React Exports

```typescript
import {
  // Providers
  PluginProvider,         // Wrap app to enable plugin hooks
  
  // Layout System
  createLayoutContext,    // Create layout state management
  createSlot,            // Create item slot (toolbar, sidebar, etc)
  createLayoutSlot,      // Create themeable component
  
  // Hooks
  usePlugins,            // Get all plugins
  useEnabledPlugins,     // Get enabled plugins
  usePlugin,             // Get plugin by ID
  usePluginHost,         // Get host instance
  useCurrentPlugin,      // Get currently rendering plugin
  createTypedHooks,      // Factory for typed hooks
  
  // Components
  PluginEntrypoints,     // Render all plugin entrypoints
} from '@pkl.js/react/react';
```

### Build Tools

```typescript
import { buildPlugin } from '@pkl.js/react-sdk';

await buildPlugin({
  entry: './src/index.tsx',
  outDir: './dist',
  meta: {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0'
  }
});
```

## 🎨 Examples

Check the [examples/](examples/) directory for:
- **examples/sdk** - Complete SDK implementation
- **examples/app** - Host application
- **examples/plugins** - Various plugin types

## 📖 Documentation

- [Getting Started](docs/GETTING_STARTED.md) - Build your first SDK
- [API Documentation](docs/API.md) - Detailed API reference
- [Architecture](docs/ARCHITECTURE.md) - How it works
- [Theme System](docs/THEME_SYSTEM.md) - Layout slots and theming
- [Contributing](docs/CONTRIBUTING.md) - Development guide

## 🚀 Quick Example

```typescript
// 1. Create plugin host
import { PluginHost } from '@pkl.js/react';
const host = new PluginHost();

// 2. Load plugins
await host.add(() => import('./my-plugin.js'), { enabled: true });

// 3. Wrap app
import { PluginProvider } from '@pkl.js/react/react';

<PluginProvider host={host}>
  <App />
</PluginProvider>
```

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

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## 📄 License

MIT

---

**React PKL** - Toolkit for building extensible React applications.
