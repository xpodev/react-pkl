---
sidebar_position: 8
title: Architecture
---

# Architecture Overview

This document provides a high-level overview of the React PKL v0.2.0 architecture.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Host Application                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Your Custom SDK Layer                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │   Context    │  │    Slots     │  │   Style    │  │  │
│  │  │  Definition  │  │  Definition  │  │  Context   │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React PKL Core                            │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌───────────────┐  │  │
│  │  │  Plugin     │ │    Theme     │ │   Resource    │  │  │
│  │  │   Host      │ │   Manager    │ │   Tracker     │  │  │
│  │  └─────────────┘ └──────────────┘ └───────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         React Integration                       │  │  │
│  │  │  Provider │ LayoutContext │ Hooks │ Slots      │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Uses
                            ▼
            ┌───────────────────────────────────────┐
            │              Plugins                  │
            │  ┌──────────┐  ┌──────────┐          │
            │  │ Standard │  │  Theme   │  ┌────┐  │
            │  │ Plugin   │  │  Plugin  │  │... │  │
            │  └──────────┘  └──────────┘  └────┘  │
            └───────────────────────────────────────┘
```

## Core Components

### 1. PluginHost

Central controller for plugin lifecycle, theme management, and layout slots.

```
PluginHost<TContext>
├── Theme Management
│   ├── setThemePlugin(plugin)
│   ├── getThemePlugin()
│   └── getLayoutSlotOverride(component)
│
├── Resource Tracking
│   ├── trackResource(cleanup)
│   └── getCurrentPlugin()
│
└── Delegates to PluginManager
    ├── add()
    ├── enable()
    ├── disable()
    └── remove()
```

**Responsibilities:**
- Manage theme plugin activation/deactivation
- Track layout slot overrides per theme
- Handle resource cleanup for plugins
- Delegate lifecycle operations to PluginManager
- Notify React components of state changes

**Theme System:**
- Only one theme plugin active at a time
- Theme plugins use `onThemeEnable(slots)` to register layout overrides
- Theme plugins use `onThemeDisable()` for cleanup
- Layout slots are stored in `Map<Function, Function>`

### 2. Layout Context & Slots

Context-driven architecture for UI composition.

```
LayoutContext
├── slots: Map<string, SlotContent[]>
├── layoutSlots: Map<Function, Function>
└── Methods
    ├── registerSlotItem(name, component)
    ├── getSlotComponents(name)
    └── getLayoutSlotOverride(component)
```

**Layout Slot Pattern:**
```tsx
// Default implementation
export function AppHeader() {
  const { toolbar } = useAppLayout();
  return <header>{toolbar}</header>;
}

// Theme plugin overrides
plugin.onThemeEnable(slots => {
  function DarkHeader() {
    const { toolbar } = useAppLayout();
    return <header style={{background: '#000'}}>{toolbar}</header>;
  }
  slots.set(AppHeader, DarkHeader);
});
```

**Key Features:**
- Components use hooks instead of props (no prop drilling)
- `useAppContext()` - Access host application context
- `useAppLayout()` - Access layout slot content
- `useAppLayoutSlot()` - Check for theme overrides
- Theme plugins can replace entire layout components

### 3. Style Context

Type-safe theming with CSS variables.

```
StyleContext
├── StyleProvider (component)
├── useStyles() (hook)
└── StyleVariables (interface)
    ├── bgPrimary
    ├── textPrimary
    ├── textSecondary
    ├── accentColor
    ├── linkColor
    ├── borderColor
    ├── cardBg
    ├── cardBgSecondary
    ├── toolbarBg
    ├── sidebarBg
    ├── textMuted
    └── borderAccent
```

**Usage Pattern:**
```tsx
<StyleProvider variables={{ bgPrimary: '#1a1a1a', textPrimary: '#fff' }}>
  <MyComponent />
</StyleProvider>

function MyComponent() {
  const styles = useStyles();
  return <div style={{ background: styles.bgPrimary }}>...</div>;
}
```

### 4. Plugin Types

#### Standard Plugins

Extend functionality through slots and lifecycle hooks.

```typescript
export const myPlugin: PluginModule<AppContext> = {
  meta: { id: 'my-plugin', name: 'My Plugin', version: '1.0.0' },
  
  activate(context) {
    // Initialize, register routes, etc.
  },
  
  deactivate() {
    // Cleanup
  },
  
  entrypoint() {
    return <MyComponent />;
  }
};
```

#### Theme Plugins

Override layout components and provide styling.

```typescript
export const darkTheme: PluginModule<AppContext> = {
  meta: { id: 'dark-theme', name: 'Dark Theme', version: '1.0.0' },
  
  onThemeEnable(slots) {
    slots.set(AppHeader, DarkHeader);
    slots.set(AppSidebar, DarkSidebar);
    slots.set(AppDashboard, DarkDashboard);
    
    // Return cleanup function
    return () => {
      // Cleanup theme-specific resources
    };
  },
  
  onThemeDisable() {
    // Additional cleanup if needed
  }
};
```

#### Static Plugins

No lifecycle methods - always available.

```typescript
export const staticPlugin: PluginModule<AppContext> = {
  meta: { id: 'static', name: 'Static Plugin', version: '1.0.0' },
  
  // No activate/deactivate
  entrypoint() {
    return <ToolbarButton />;
  }
};
```

## Data Flow

### Plugin Loading & Activation

```
┌──────────┐      ┌────────────┐      ┌──────────────┐
│  App     │─add()→│ PluginHost │─add()→│ PluginManager│
└──────────┘      └──────┬─────┘      └──────┬───────┘
                         │                    │
                  enable(id)           enable(id)
                         │                    │
                         ▼                    ▼
                  ┌─────────────┐      ┌────────────┐
                  │   plugin.   │      │  Registry  │
                  │ activate()  │      │   Update   │
                  └─────────────┘      └────────────┘
```

### Theme Activation

```
┌──────────┐                    ┌────────────┐
│  App     │─setThemePlugin()───→│ PluginHost │
└──────────┘                    └──────┬─────┘
                                       │
                                       ├─→ Disable current theme
                                       │   ├─→ Call cleanup function
                                       │   └─→ Call onThemeDisable()
                                       │
                                       ├─→ Clear layout slot map
                                       │
                                       └─→ Enable new theme
                                           ├─→ Call onThemeEnable(slots)
                                           ├─→ Store cleanup function
                                           └─→ Notify React components
```

### Hook-Based Component Flow

```
Component Render
      │
      ├─→ useAppContext()
      │   └─→ Access router, plugins, etc.
      │
      ├─→ useAppLayout()
      │   └─→ Access slot content (toolbar, sidebar, dashboard)
      │
      ├─→ useAppLayoutSlot(AppHeader)
      │   ├─→ Check theme override
      │   └─→ Return override or default
      │
      └─→ useStyles()
          └─→ Access theme variables
```

### Resource Cleanup

```
Plugin State                     Resource Tracking
     │                                  │
activate()                              │
     ├─→ context.router.registerRoute() ┐
     ├─→ context.events.on(...)         ├─→ trackResource()
     ├─→ window.addEventListener(...)   ┘   └─→ Map<plugin, cleanup[]>
     │                                              │
disable()                                           │
     └─→ PluginHost.cleanup(plugin) ───────────────┤
                                                    ▼
                                            Run all cleanup functions
                                                    │
                                                    ├─→ unregisterRoute()
                                                    ├─→ events.off()
                                                    └─→ removeEventListener()
```

## React Integration Architecture

```
React Component Tree
│
├─ <PluginProvider host={pluginHost}>
│  │
│  ├─ Context: { host, plugins, version }
│  │
│  ├─ <LayoutProvider>
│  │  │
│  │  ├─ Context: { slots, layoutSlots }
│  │  │
│  │  └─ <StyleProvider variables={...}>
│  │     │
│  │     ├─ Context: { styleVariables }
│  │     │
│  │     └─ App Components
│  │        │
│  │        ├─ <Slot name="toolbar" />
│  │        │  │
│  │        │  └─→ Render slot items
│  │        │
│  │        ├─ <LayoutSlot default={AppHeader} />
│  │        │  │
│  │        │  ├─→ Check for theme override
│  │        │  └─→ Render override or default
│  │        │
│  │        └─ Custom Components
│  │           │
│  │           ├─→ useAppContext()
│  │           ├─→ useAppLayout()
│  │           └─→ useStyles()
│  │
│  └─ <PluginEntrypoints />
│     └─→ Render plugin.entrypoint() for each plugin
```

**Key Concepts:**
- `PluginProvider` wraps app with plugin context
- `LayoutProvider` manages slots and layout overrides
- `StyleProvider` provides theme variables
- Hooks enable components to access context without prop drilling
- Theme overrides are resolved at render time

## Plugin Lifecycle States

```
         add()
┌───────────────────┐
│   Not Loaded      │
└─────────┬─────────┘
          │
          ▼
      ┌───────┐           enable()
      │ Added ├─────────────────────┐
      └───┬───┘                     │
          │                         ▼
          │                   ┌──────────┐
          │                   │ Enabled  │
          │                   │(active)  │
          │                   └────┬─────┘
          │                        │
          │                        │ disable()
          │                        │
          │                        ▼
          │                   ┌──────────┐
          │ remove()          │ Disabled │
          └◄──────────────────┤          │
                              └──────────┘

Special Cases:
- Static Plugin: always "Enabled", cannot be disabled
- Theme Plugin: can be set as active theme independently
```

## Type System Architecture

```typescript
// Core interfaces
interface PluginModule<TContext> {
  meta: PluginMeta;
  activate?(context: TContext): void | Promise<void>;
  deactivate?(): void | Promise<void>;
  entrypoint?(): ReactNode;
  onThemeEnable?(slots: Map<Function, Function>): void | (() => void);
  onThemeDisable?(): void;
}

// Generic over context type
PluginHost<TContext>
    │
    ├─→ PluginManager<TContext>
    │      │
    │      └─→ PluginRegistry<TContext>
    │             │
    │             └─→ PluginEntry<TContext>
    │                    │
    │                    └─→ PluginModule<TContext>
    │                           │
    │                           └─→ activate(context: TContext)
    │
    └─→ Theme tracking
           │
           └─→ Map<Function, Function> (layout slot overrides)
```

**Type Safety:**
- Everything is generic over `TContext`
- Context type defined once in SDK
- Propagates through entire system
- Full TypeScript inference in plugins  
- Layout slots are type-safe components

## SDK Layer Pattern

```
Plugin Developer Code
        │
        │ imports
        ▼
Your Custom SDK ──────────┐
        │                  │
        │ uses             │ defines
        ▼                  ▼
React PKL Core      AppContext<YourType>
        │           Layout Slots (AppHeader, AppSidebar)
        │           Style Context (useStyles)
        │           Hooks (useAppContext, useAppLayout)
        │
        │ provides
        ▼
Plugin System Infrastructure
```

**Separation of Concerns:**
1. **React PKL Core** - Generic plugin and theme system
2. **Your SDK** - Domain-specific APIs/types/slots/styling
3. **Plugins** - Business logic using your SDK

## Extension Point (Slot) System

### Standard Slots

For adding multiple components to a slot.

```
Host Application          Plugin A           Plugin B
      │                      │                  │
      │ defines              │ provides         │ provides
      ▼                      ▼                  ▼
┌──────────┐          ┌──────────┐        ┌──────────┐
│"toolbar" │          │Component │        │Component │
│   Slot   │          │    A     │        │    B     │
└────┬─────┘          └────┬─────┘        └────┬─────┘
     │                     │                    │
     │ <Slot               │                    │
     │  name="toolbar"/>   │                    │
     │                     │                    │
     └──────renders────────┴────────────────────┘
                           │
                           ▼
                    [ComponentA, ComponentB]
```

### Layout Slots

For theme plugins to override entire layout components.

```
Default Theme              Dark Theme Plugin
      │                          │
      │ defines                  │ provides
      ▼                          ▼
┌─────────────┐          ┌──────────────┐
│  AppHeader  │          │  DarkHeader  │
│  (default)  │          │  (override)  │
└──────┬──────┘          └──────┬───────┘
       │                        │
       │                        │ onThemeEnable(slots)
       │ <LayoutSlot            │ slots.set(AppHeader, DarkHeader)
       │  default={AppHeader}/> │
       │                        │
       └────────────────────────┘
                │
                ▼
         Renders DarkHeader
```

## Context-Driven Component Pattern

v0.2.0 introduces hook-based components that don't require props.

### Old Pattern (v0.1.0)

```tsx
// Props needed at every level
<AppHeader toolbar={toolbarItems} />
<AppSidebar routes={pluginRoutes} items={sidebarItems} />
```

### New Pattern (v0.2.0)

```tsx
// No props - uses hooks
<AppHeader />
<AppSidebar />

// Implementation
function AppHeader() {
  const { toolbar } = useAppLayout();  // Get content from context
  const { router } = useAppContext();  // Get app context
  return <header>{toolbar}</header>;
}
```

**Benefits:**
- No prop drilling
- Cleaner component signatures
- Easier to override in themes
- Better encapsulation

## Build System Architecture

```
Plugin Source Code
       │
       │ entry
       ▼
┌──────────────┐
│   esbuild    │
│              │
│ • Bundle     │
│ • Transform  │
│ • Minify     │
│ • External   │
│   SDK deps   │
└──────┬───────┘
       │
       ├──► dist/index.js (ESM)
       └──► dist/index.js.map
```

**SDK is external:**
- Plugins import SDK at runtime
- SDK not bundled into plugin
- Host provides SDK to all plugins
- Avoids version conflicts

## Advanced Patterns

### Theme with Global Styles

```typescript
export const darkTheme: PluginModule = {
  meta: { id: 'dark', name: 'Dark', version: '1.0.0' },
  
  onThemeEnable(slots) {
    // Register layout overrides
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
    
    // Return cleanup
    return () => {
      document.head.removeChild(style);
    };
  }
};
```

### Nested Style Providers

```tsx
function DarkHeader() {
  return (
    <StyleProvider variables={{ bgPrimary: '#000', textPrimary: '#fff' }}>
      <header>
        <StyleProvider variables={{ accentColor: '#60a5fa' }}>
          <Toolbar />  {/* Inherits bgPrimary, textPrimary, accentColor */}
        </StyleProvider>
      </header>
    </StyleProvider>
  );
}
```

Variables cascade down - inner providers override outer ones.

### Resource Tracking

```typescript
export const myPlugin: PluginModule<AppContext> = {
  meta: { id: 'my-plugin', name: 'My Plugin', version: '1.0.0' },
  
  activate(context) {
    // Register a route
    const unregisterRoute = context.router.registerRoute({
      path: '/my-page',
      component: MyPage
    });
    context.trackResource(unregisterRoute);
    
    // Add event listener
    const handler = () => console.log('resize');
    window.addEventListener('resize', handler);
    context.trackResource(() => {
      window.removeEventListener('resize', handler);
    });
    
    // All tracked resources cleaned up when plugin disabled
  }
};
```

## Summary

React PKL v0.2.0 architecture is built on these principles:

1. **Context-Driven** - Components use hooks, not props
2. **Theme System** - Plugins can override entire layout with onThemeEnable/onThemeDisable
3. **Style Context** - Type-safe theme variables accessible via useStyles()
4. **Separation of Concerns** - Core system, SDK layer, and plugins are distinct
5. **Type Safety** - Generic types flow through the entire system
6. **Automatic Cleanup** - Resources are tracked and cleaned up automatically
7. **Static Plugins** - Support for plugins without lifecycle management
8. **Layout Slots** - Map-based component override system for themes

The architecture enables:
- ✅ Type-safe plugin and theme development
- ✅ Automatic resource management
- ✅ Zero prop drilling with hooks
- ✅ Flexible theming system
- ✅ Clean separation of concerns
- ✅ Seamless React integration
- ✅ Multiple theme support
- ✅ Style variable cascading

### Migration from v0.1.0

If you're upgrading from v0.1.0:

1. **PluginManager** still exists but is wrapped by **PluginHost**
2. **Layout components** should use hooks instead of props:
   - Replace `toolbar` prop with `useAppLayout().toolbar`
   - Replace `pluginRoutes` prop with `useAppContext().router.getRoutes()`
3. **Theme plugins** use new `onThemeEnable/onThemeDisable` hooks
4. **Style context** is new - use for theme variables
5. **Static plugins** are now supported (no activate/deactivate needed)

See [THEME_SYSTEM.md](./THEME_SYSTEM) for detailed theme system documentation.


```
         add()
┌───────────────────┐
│   Not Loaded      │
└─────────┬─────────┘
          │
          ▼
      ┌───────┐           enable()
      │ Added ├─────────────────────┐
      └───┬───┘                     │
          │                         ▼
          │                   ┌──────────┐
          │                   │ Enabled  │
          │                   │(active)  │
          │                   └────┬─────┘
          │                        │
          │                        │ disable()
          │                        │
          │                        ▼
          │                   ┌──────────┐
          │ remove()          │ Disabled │
          └◄──────────────────┤          │
                              └──────────┘
```

## Type System Architecture

```typescript
// Generic over context type
interface PluginModule<TContext> {
  meta: PluginMeta;
  activate?(context: TContext): void | Promise<void>;
  deactivate?(): void | Promise<void>;
  components?: Record<string, ComponentType<any>>;
}

// Flows through the system
PluginManager<TContext>
    │
    ├─→ PluginRegistry<TContext>
    │
    └─→ PluginEntry<TContext>
            │
            └─→ PluginModule<TContext>
                    │
                    └─→ activate(context: TContext)
```

**Type Safety:**
- Everything is generic over `TContext`
- Context type defined once in SDK
- Propagates through entire system
- Full type checking in plugins

## SDK Layer Pattern

```
Plugin Developer Code
        │
        │ imports
        ▼
Your Custom SDK ──────────┐
        │                  │
        │ uses             │ defines
        ▼                  ▼
React PKL Core      AppContext<YourType>
        │
        │ provides
        ▼
Plugin System Infrastructure
```

**Separation of Concerns:**
1. **React PKL Core** - Generic plugin system
2. **Your SDK** - Domain-specific APIs/types
3. **Plugins** - Business logic using your SDK

## Extension Point (Slot) System

```
Host Application          Plugin A           Plugin B
      │                      │                  │
      │ defines              │ provides         │ provides
      ▼                      ▼                  ▼
┌──────────┐          ┌──────────┐        ┌──────────┐
│"toolbar" │          │Component │        │Component │
│   Slot   │          │    A     │        │    B     │
└────┬─────┘          └────┬─────┘        └────┬─────┘
     │                     │                    │
     │ <PluginSlot         │                    │
     │  name="toolbar"/>   │                    │
     │                     │                    │
     └──────renders────────┴────────────────────┘
                           │
                           ▼
                    [ComponentA, ComponentB]
```

## Build System Architecture

```
Plugin Source Code
       │
       │ entry
       ▼
┌──────────────┐
│   esbuild    │
│              │
│ • Bundle     │
│ • Transform  │
│ • Minify     │
└──────┬───────┘
       │
       ├──► index.js (ESM/CJS)
       ├──► index.js.map
       └──► meta.json (optional)
```

## Summary

React PKL's architecture is built on these principles:

1. **Separation of Concerns** - Core system, SDK layer, and plugins are distinct
2. **Type Safety** - Generic types flow through the entire system
3. **Flexibility** - Two modes (standalone/client) for different use cases
4. **Automatic Cleanup** - Resources are tracked and cleaned up automatically
5. **React Native** - Deep integration with React through hooks and components
6. **Extensibility** - SDK layer allows customization without forking

The architecture enables:
- ✅ Type-safe plugin development
- ✅ Automatic resource management
- ✅ Flexible deployment models
- ✅ Clean separation of concerns
- ✅ Seamless React integration
