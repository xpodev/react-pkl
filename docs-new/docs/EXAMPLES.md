---
sidebar_position: 3
title: Examples
---

# Examples Guide

This guide explains the example applications and plugins included with React PKL.

## Overview

The `examples/` directory contains three main parts:

1. **SDK** - A custom SDK built on React PKL (`examples/sdk`)
2. **App** - A host application using the SDK (`examples/app`)
3. **Plugins** - Sample plugins demonstrating various features (`examples/plugins`)

## Running the Examples

### Quick Start

```bash
# From the root directory
npm install
npm run build

# Run the example app
cd examples/app
npm run dev
```

Open http://localhost:5173 to see the app with plugins loaded.

## Example SDK (`examples/sdk`)

A demonstration of how to build a custom SDK on top of React PKL.

### Features

- **AppContext** - Defines services available to plugins:
  - `notifications` - Show/dismiss notifications
  - `router` - Navigation and route registration
  - `user` - User information
  - `logger` - Namespaced logging

- **Slots** - Four extension points:
  - `toolbar` - Header toolbar
  - `sidebar` - Left sidebar
  - `content` - Main content area
  - `settings` - Settings page

- **React Integration** - Custom hooks:
  - `useAppContext()` - Access app context in plugin components
  - Re-exports React PKL hooks

### Key Files

```typescript
// App context definition
examples/sdk/src/app-context.ts

// Slot definitions
examples/sdk/src/slots.ts

// Plugin helpers
examples/sdk/src/plugin.ts

// React integration
examples/sdk/src/react/
```

### Usage in Plugins

```typescript
import { definePlugin } from 'example-sdk';
import { useAppContext } from 'example-sdk/react';

export default definePlugin({
  meta: { /* ... */ },
  activate(context) {
    // Access all services
    context.notifications.show('Hello!');
    context.router.navigate('/page');
    console.log(context.user?.name);
  },
  components: {
    toolbar: MyComponent,
  },
});
```

## Example App (`examples/app`)

A fully-functional host application demonstrating plugin integration.

### Features

- React Router integration
- Dynamic route registration from plugins
- Notification system
- Local storage for plugin state persistence
- Plugin management UI

### Architecture

```
App.tsx
├── Plugin Manager Setup
├── Service Implementations
│   ├── NotificationService
│   ├── RouterService
│   └── LoggerService
├── Plugin Loading
└── React Integration
    ├── PluginProvider
    └── PluginSlots
```

### Key Features Demonstrated

#### 1. Context Creation

```typescript
// examples/app/src/mock-context.ts
export function createMockAppContext(...services): AppContext {
  return {
    notifications: { /* ... */ },
    router: {
      navigate: (path) => navigate(path),
      registerRoute: (route) => {
        routes.set(route.path, route);
        // Auto-cleanup registered!
      },
    },
    user: { id: '1', name: 'Alice', /* ... */ },
    logger: { /* ... */ },
  };
}
```

#### 2. Plugin State Persistence

```typescript
// examples/app/src/local-storage-adapter.ts
export class LocalStoragePluginProvider {
  getPlugins() {
    const stored = localStorage.getItem('plugins');
    return JSON.parse(stored || '[]');
  }

  savePluginState(pluginId: string, enabled: boolean) {
    // Save to localStorage
  }
}
```

#### 3. Dynamic Routes

```typescript
// Plugins can register routes
context.router.registerRoute({
  path: '/my-page',
  component: MyPage,
  label: 'My Page',
});

// App renders them dynamically
<Routes>
  {staticRoutes}
  {pluginRoutes.map(route => (
    <Route path={route.path} element={<route.component />} />
  ))}
</Routes>
```

## Example Plugins (`examples/plugins`)

Four sample plugins demonstrating different capabilities.

### 1. Hello Plugin (`hello-plugin.tsx`)

**The simplest possible plugin**

Features:
- Basic plugin structure
- Context usage in `activate`
- Single toolbar component

```typescript
export default definePlugin({
  meta: {
    id: 'example.hello',
    name: 'Hello Plugin',
    version: '1.0.0',
  },

  activate(context) {
    context.notifications.show('Hello Plugin is active!', 'success');
  },

  components: {
    toolbar: HelloToolbarItem,
  },
});
```

**What it demonstrates:**
- Minimal plugin structure
- Lifecycle hooks
- Contributing UI components
- Basic context access

### 2. User Greeting Plugin (`user-greeting-plugin.tsx`)

**Accessing application context**

Features:
- Reads user information from context
- Dynamic content based on context
- Multiple components in different slots

```typescript
export default definePlugin({
  activate(context) {
    const userName = context.user?.name || 'Guest';
    context.notifications.show(`Welcome, ${userName}!`);
  },

  components: {
    toolbar: GreetingBadge,
    content: UserInfoCard,
  },
});
```

**What it demonstrates:**
- Accessing app context data
- Conditional rendering based on context
- Multiple slot components

### 3. Theme Toggle Plugin (`theme-toggle-plugin.tsx`)

**State management and persistence**

Features:
- Internal state management
- Local storage persistence
- Style injection
- Event handling

```typescript
export default definePlugin({
  activate(context) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
  },

  components: {
    toolbar: ThemeToggleButton,
    settings: ThemeSettings,
  },
});
```

**What it demonstrates:**
- Plugin state management
- Persistence across sessions
- DOM manipulation
- User interaction

### 4. Custom Page Plugin (`custom-page-plugin.tsx`)

**Advanced: Route registration**

Features:
- Dynamic route registration
- Automatic cleanup (no manual deactivate needed!)
- Nested slot usage
- Complex UI

```typescript
export default definePlugin({
  activate(context) {
    context.router.registerRoute({
      path: '/my-custom-page',
      component: CustomPage,
      label: '📄 My Custom Page',
    });
  },

  components: {
    settings: CustomPageSettings,
  },
});

function CustomPage() {
  return (
    <div>
      <h1>Custom Page</h1>
      {/* This page can also host plugin components! */}
      <PluginSlot name="toolbar" />
    </div>
  );
}
```

**What it demonstrates:**
- Route registration
- Automatic resource cleanup
- Complex components
- Nested plugin slots
- Deep integration with host app

## Plugin Comparison Matrix

| Feature | Hello | User Greeting | Theme Toggle | Custom Page |
|---------|-------|---------------|--------------|-------------|
| Basic structure | ✅ | ✅ | ✅ | ✅ |
| Context access | ✅ | ✅ | ✅ | ✅ |
| Multiple components | ❌ | ✅ | ✅ | ✅ |
| State management | ❌ | ❌ | ✅ | ✅ |
| Persistence | ❌ | ❌ | ✅ | ❌ |
| Route registration | ❌ | ❌ | ❌ | ✅ |
| Nested slots | ❌ | ❌ | ❌ | ✅ |

## Building the Examples

### Development Mode

```bash
# Run app with hot reload
cd examples/app
npm run dev
```

Plugins are loaded directly from source with HMR support.

### Production Build

```bash
# Build plugins
cd examples/plugins
npm run build

# Build app
cd ../app
npm run build
npm run preview
```

## Creating Your Own Plugin

1. **Copy a template:**
   ```bash
   cp examples/plugins/src/hello-plugin.tsx my-plugin.tsx
   ```

2. **Update metadata:**
   ```typescript
   meta: {
     id: 'com.mycompany.myplugin',
     name: 'My Plugin',
     version: '1.0.0',
   }
   ```

3. **Implement features:**
   ```typescript
   activate(context) {
     // Your initialization
   },

   components: {
     toolbar: MyComponent,
   }
   ```

4. **Load in app:**
   ```typescript
   await manager.add(
     () => import('./my-plugin.tsx'),
     { enabled: true }
   );
   ```

## Common Patterns

### Plugin with Settings

```typescript
// Combine content and settings components
export default definePlugin({
  components: {
    content: MainFeature,
    settings: SettingsPanel,
  },
});
```

### Plugin with Multiple Features

```typescript
export default definePlugin({
  activate(context) {
    // Register multiple routes
    context.router.registerRoute({ path: '/feature1', /* ... */ });
    context.router.registerRoute({ path: '/feature2', /* ... */ });

    // Set up event listeners
    context.events.on('user-action', handler);
  },

  components: {
    toolbar: ToolbarButton,
    sidebar: SidebarNav,
    content: MainContent,
  },
});
```

### Plugin with Dependencies

```typescript
export default definePlugin({
  meta: {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    // Custom metadata
    dependencies: ['other-plugin-id'],
  },

  activate(context) {
    // Check if dependency is available
    const depApi = (context as any).pluginAPIs?.['other-plugin-id'];
    if (!depApi) {
      throw new Error('Required plugin not found');
    }
  },
});
```

## Troubleshooting

### Plugin Not Appearing

1. Check plugin is loaded: `manager.getAll()`
2. Check plugin is enabled: `manager.getEnabled()`
3. Verify slot name matches
4. Check browser console for errors

### Hot Reload Not Working

1. Ensure dev server is running
2. Check Vite configuration
3. Restart dev server
4. Clear browser cache

### Type Errors

1. Import types from `example-sdk`, not `@react-pkl/core`
2. Ensure SDK is built: `cd examples/sdk && npm run build`
3. Check TypeScript version compatibility

## Next Steps

After exploring the examples:

1. Create your own SDK based on `examples/sdk`
2. Customize the app context for your use case
3. Define your own slots
4. Build plugins for your specific needs

See the [Getting Started Guide](./GETTING_STARTED.md) for creating your own plugin system.
