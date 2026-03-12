# @pkl.js/react

The core plugin management system for React PKL.

## Installation

```bash
npm install @pkl.js/react react
```

## Quick Start

```typescript
import { PluginManager } from '@pkl.js/react';
import { PluginProvider, PluginSlot } from '@pkl.js/react/react';

// Create plugin manager
const manager = new PluginManager(myAppContext);

// Load plugins
await manager.add(() => import('./my-plugin.js'), { enabled: true });

// Use in React
function App() {
  return (
    <PluginProvider registry={manager.registry}>
      <PluginSlot name="toolbar" />
    </PluginProvider>
  );
}
```

## Features

- **Standalone Mode** - Full plugin lifecycle control (add, enable, disable, remove)
- **Client Mode** - Fetch plugins from remote manifest
- **Automatic Resource Cleanup** - Resources cleaned up when plugins disabled
- **Type-Safe** - Full TypeScript support with generics
- **React Integration** - Hooks and components for seamless integration

## API Overview

### Plugin Management

```typescript
// Standalone mode
const manager = new PluginManager<AppContext>(context);
await manager.add(plugin, { enabled: true });
await manager.enable('plugin-id');
await manager.disable('plugin-id');
await manager.remove('plugin-id');

// Client mode
const client = new PluginClient({ 
  manifestUrl: 'https://api.example.com/plugins',
  context 
});
await client.sync();
```

### React Integration

```tsx
import { 
  PluginProvider, 
  PluginSlot,
  usePlugins,
  useEnabledPlugins,
  useSlotComponents,
} from '@pkl.js/react/react';

// Provider
<PluginProvider registry={manager.registry}>
  <App />
</PluginProvider>

// Slots
<PluginSlot name="toolbar" componentProps={{ theme: 'dark' }} />

// Hooks
const plugins = usePlugins();
const enabled = useEnabledPlugins();
const toolbarComponents = useSlotComponents('toolbar');
```

## Exports

### Main Export (`@pkl.js/react`)

- `PluginManager` - Standalone mode manager
- `PluginClient` - Client mode manager
- `PluginRegistry` - Low-level plugin storage
- `ResourceTracker` - Resource cleanup system
- Types: `PluginModule`, `PluginMeta`, `PluginEntry`, `PluginLoader`, etc.

### React Export (`@pkl.js/react/react`)

- `PluginProvider` - React context provider
- `PluginSlot` - Render plugin components
- Hooks: `usePlugins`, `useEnabledPlugins`, `usePlugin`, `usePluginMeta`, `useSlotComponents`

## Documentation

- [Getting Started Guide](../../docs/GETTING_STARTED.md)
- [API Reference](../../docs/API.md)
- [Advanced Usage](../../docs/ADVANCED.md)
- [Examples](../../examples/)

## License

[Insert license]
