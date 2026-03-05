# Quick Reference

Fast lookup for common tasks and patterns in React PKL.

## Installation

```bash
# Core package
npm install @react-pkl/core react

# SDK build tools (dev dependency)
npm install --save-dev @react-pkl/sdk
```

## Basic Setup

### Create Plugin Manager

```typescript
import { PluginManager } from '@react-pkl/core';

const manager = new PluginManager<MyAppContext>(context);
```

### Load a Plugin

```typescript
// From local module
await manager.add(() => import('./my-plugin.js'), { enabled: true });

// From object
await manager.add({
  meta: { id: 'my-plugin', name: 'My Plugin', version: '1.0.0' },
  activate: (ctx) => { /* ... */ },
}, { enabled: true });
```

### Enable/Disable Plugin

```typescript
await manager.enable('plugin-id');
await manager.disable('plugin-id');
await manager.remove('plugin-id');
```

### React Integration

```tsx
import { PluginProvider, PluginSlot } from '@react-pkl/core/react';

<PluginProvider registry={manager.registry}>
  <PluginSlot name="toolbar" />
</PluginProvider>
```

## Plugin Basics

### Minimal Plugin

```typescript
export default {
  meta: {
    id: 'com.example.plugin',
    name: 'My Plugin',
    version: '1.0.0',
  },
  
  activate(context) {
    console.log('Plugin activated!');
  },
  
  components: {
    toolbar: () => <div>Hello</div>,
  },
};
```

### With TypeScript

```typescript
import { definePlugin } from 'my-sdk';

export default definePlugin({
  meta: { /* ... */ },
  activate(context) {
    // context is typed!
    context.notifications.show('Hello');
  },
});
```

## React Hooks

```typescript
import { 
  usePlugins, 
  useEnabledPlugins,
  usePlugin,
  usePluginMeta,
  useSlotComponents,
} from '@react-pkl/core/react';

// Get all plugins
const plugins = usePlugins();

// Get enabled plugins only
const enabled = useEnabledPlugins();

// Get specific plugin
const plugin = usePlugin('plugin-id');

// Get metadata only
const metaList = usePluginMeta();

// Get components for a slot
const toolbarComponents = useSlotComponents('toolbar');
```

## Context Patterns

### Basic Context

```typescript
interface AppContext {
  user: { id: string; name: string };
  api: {
    get<T>(path: string): Promise<T>;
    post<T>(path: string, data: any): Promise<T>;
  };
}
```

### With Services

```typescript
interface AppContext {
  notifications: NotificationService;
  router: RouterService;
  storage: StorageService;
}
```

## Resource Cleanup

### Register Cleanup

```typescript
export default definePlugin({
  activate(context) {
    // Some resource
    const ws = new WebSocket('wss://example.com');
    
    // Register cleanup
    if (context._resources && context._currentPluginId) {
      context._resources.register(context._currentPluginId, () => {
        ws.close();
      });
    }
  },
});
```

### Helper Function

```typescript
// In your SDK
export function onCleanup(context: AppContext, cleanup: () => void) {
  if (context._resources && context._currentPluginId) {
    context._resources.register(context._currentPluginId, cleanup);
  }
}

// In plugins
onCleanup(context, () => ws.close());
```

## Slots

### Define Slots

```typescript
// In your SDK
export const APP_SLOTS = {
  TOOLBAR: 'toolbar',
  SIDEBAR: 'sidebar',
  CONTENT: 'content',
} as const;
```

### Use Slots

```tsx
// In your app
<PluginSlot name="toolbar" />
<PluginSlot name="sidebar" fallback={<p>No plugins</p>} />
<PluginSlot name="content" componentProps={{ theme: 'dark' }} />
```

### Provide Components

```typescript
// In plugins
export default definePlugin({
  components: {
    toolbar: MyToolbarComponent,
    sidebar: MySidebarComponent,
  },
});
```

## Events

### Event Bus

```typescript
// In your SDK
export class EventBus {
  on(event: string, handler: Function): () => void;
  emit(event: string, data: any): void;
  off(event: string, handler: Function): void;
}

// In context
interface AppContext {
  events: EventBus;
}
```

### In Plugins

```typescript
export default definePlugin({
  activate(context) {
    // Listen
    const unsubscribe = context.events.on('user-updated', (user) => {
      console.log('User:', user);
    });
    
    // Emit
    context.events.emit('plugin-ready', { pluginId: 'my-plugin' });
  },
});
```

## Route Registration

### SDK Implementation

```typescript
interface RouterService {
  registerRoute(route: {
    path: string;
    component: ComponentType;
    label?: string;
  }): void;
}
```

### Plugin Usage

```typescript
export default definePlugin({
  activate(context) {
    context.router.registerRoute({
      path: '/my-page',
      component: MyPage,
      label: 'My Page',
    });
    // Auto-cleanup when plugin disabled!
  },
});
```

## Building Plugins

### Basic Build

```typescript
import { buildPlugin } from '@react-pkl/sdk';

await buildPlugin({
  entry: './src/index.tsx',
  outDir: './dist',
  meta: {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
  },
});
```

### Production Build

```typescript
await buildPlugin({
  entry: './src/index.tsx',
  outDir: './dist',
  meta: { /* ... */ },
  formats: ['esm'],
  minify: true,
  sourcemap: true,
  external: ['lodash'],
});
```

## Client Mode

### Setup Client

```typescript
import { PluginClient } from '@react-pkl/core';

const client = new PluginClient({
  manifestUrl: 'https://api.example.com/plugins/manifest.json',
  context: myAppContext,
});

await client.sync();
```

### Manifest Format

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

## TypeScript Helpers

### Define Plugin Helper

```typescript
// In your SDK
import type { PluginModule } from '@react-pkl/core';

export type MyAppPlugin = PluginModule<MyAppContext>;

export function definePlugin(plugin: MyAppPlugin): MyAppPlugin {
  return plugin;
}
```

### Typed Slots

```typescript
interface SlotProps {
  toolbar: { compact?: boolean };
  sidebar: { collapsed?: boolean };
}

export type SlotComponents = {
  [K in keyof SlotProps]?: ComponentType<SlotProps[K]>;
};

// Use in plugins
export default definePlugin({
  components: {
    toolbar: ({ compact }) => <div />,
  } satisfies SlotComponents,
});
```

## Common Patterns

### Lazy Loading

```typescript
// Load only when needed
if (user.role === 'admin') {
  await manager.add(() => import('./admin-plugin.js'), { enabled: true });
}
```

### Plugin State

```typescript
export default definePlugin({
  activate(context) {
    const state = context.storage.get('plugin-state') || {};
    // Use state...
  },
});
```

### Multiple Routes

```typescript
export default definePlugin({
  activate(context) {
    const routes = [
      { path: '/page1', component: Page1 },
      { path: '/page2', component: Page2 },
    ];
    
    routes.forEach(route => context.router.registerRoute(route));
  },
});
```

### Conditional Components

```typescript
export default definePlugin({
  components: {
    toolbar: ({ user }) => user?.role === 'admin' 
      ? <AdminButton /> 
      : null,
  },
});
```

## Testing

### Unit Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import plugin from './my-plugin';

describe('MyPlugin', () => {
  it('should activate', async () => {
    const mockContext = {
      notifications: { show: vi.fn() },
    };
    
    await plugin.activate(mockContext);
    
    expect(mockContext.notifications.show).toHaveBeenCalled();
  });
});
```

### Integration Test

```typescript
import { render } from '@testing-library/react';
import { PluginProvider, PluginSlot } from '@react-pkl/core/react';
import { PluginManager } from '@react-pkl/core';

it('renders plugin', async () => {
  const manager = new PluginManager();
  await manager.add(myPlugin, { enabled: true });
  
  const { getByText } = render(
    <PluginProvider registry={manager.registry}>
      <PluginSlot name="toolbar" />
    </PluginProvider>
  );
  
  expect(getByText('Plugin Content')).toBeInTheDocument();
});
```

## Debugging

### Check Plugin Status

```typescript
// Get all plugins
console.log(manager.getAll());

// Get enabled plugins
console.log(manager.getEnabled());

// Get specific plugin
console.log(manager.registry.get('plugin-id'));
```

### Subscribe to Events

```typescript
manager.subscribe((event) => {
  console.log('Plugin event:', event);
});
```

### Check Resources

```typescript
// Check if plugin has resources
console.log(manager.resources.has('plugin-id'));
```

## Common Issues

### Plugin Not Rendering

1. Check plugin is enabled: `manager.getEnabled()`
2. Verify slot name matches
3. Check component is exported
4. Look for errors in console

### Type Errors

1. Import from your SDK, not `@react-pkl/core`
2. Ensure SDK is built
3. Check `tsconfig.json` settings

### Cleanup Not Working

1. Verify `_resources` is in context
2. Check `_currentPluginId` is set during activate
3. Ensure cleanup is registered before activate returns

## Further Reading

- [Getting Started Guide](./GETTING_STARTED.md)
- [API Reference](./API.md)
- [Advanced Usage](./ADVANCED.md)
- [Examples](./EXAMPLES.md)
- [Architecture](./ARCHITECTURE.md)
