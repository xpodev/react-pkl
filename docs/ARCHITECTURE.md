# Architecture Overview

This document provides a high-level overview of the React PKL architecture.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Host Application                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Your Custom SDK Layer                     │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │   Context   │  │    Slots     │  │   Helpers   │  │  │
│  │  │ Definition  │  │  Definition  │  │  (optional) │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React PKL Core                            │  │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────────┐  │  │
│  │  │  Plugin    │ │  Plugin    │ │    Resource      │  │  │
│  │  │  Manager/  │ │  Registry  │ │    Tracker       │  │  │
│  │  │  Client    │ │            │ │                  │  │  │
│  │  └────────────┘ └────────────┘ └──────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         React Integration                       │  │  │
│  │  │  Provider │ Slot │ Hooks                        │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Uses
                            ▼
            ┌───────────────────────────────┐
            │         Plugins               │
            │  ┌────────┐  ┌────────┐      │
            │  │ Plugin │  │ Plugin │  ... │
            │  │   A    │  │   B    │      │
            │  └────────┘  └────────┘      │
            └───────────────────────────────┘
```

## Core Components

### 1. PluginManager (Standalone Mode)

Manages the complete plugin lifecycle with full control.

```
PluginManager
├── add() ─────────┐
├── enable() ──────┤───► PluginRegistry
├── disable() ─────┤
└── remove() ──────┘
      │
      ├──► ResourceTracker (cleanup)
      └──► Plugin.activate(context)
```

**Responsibilities:**
- Add/remove plugins dynamically
- Enable/disable plugins
- Pass context to plugins
- Trigger automatic cleanup

### 2. PluginClient (Client Mode)

Fetches plugins from a remote manifest.

```
PluginClient
└── sync() ────► Fetch Manifest
                      │
                      ├──► Download Plugin
                      ├──► Load Module
                      └──► Register in Registry
```

**Responsibilities:**
- Fetch plugin manifest from server
- Dynamically import remote plugins
- Register plugins automatically
- Pass context to plugins

### 3. PluginRegistry

Low-level storage and event emitter for plugins.

```
PluginRegistry
├── Map<id, PluginEntry>
├── Set<Listeners>
└── Methods
    ├── add()
    ├── remove()
    ├── get()
    ├── getAll()
    ├── getEnabled()
    └── subscribe()
```

**Responsibilities:**
- Store plugin entries
- Track plugin status (enabled/disabled)
- Emit lifecycle events
- Provide read access

### 4. ResourceTracker

Automatic cleanup system for plugin resources.

```
ResourceTracker
├── Map<pluginId, CleanupFunction[]>
└── Methods
    ├── register(pluginId, cleanup)
    └── cleanup(pluginId) ──► Run all cleanups
```

**Responsibilities:**
- Register cleanup functions
- Associate cleanups with plugins
- Execute cleanups when plugin disabled
- Handle cleanup errors gracefully

## Data Flow

### Plugin Loading (Standalone Mode)

```
┌──────────┐      ┌───────────────┐      ┌──────────────┐
│  App     │─add()→│ PluginManager │─add()→│   Registry   │
└──────────┘      └───────┬───────┘      └──────┬───────┘
                          │                      │
                   enable(id)             setStatus(id, 'enabled')
                          │                      │
                          ▼                      ▼
                  ┌───────────────┐      ┌──────────────┐
                  │ plugin.       │      │   Emit       │
                  │ activate(ctx) │      │   'enabled'  │
                  └───────────────┘      └──────────────┘
```

### Plugin Loading (Client Mode)

```
┌──────────┐      ┌──────────────┐      ┌──────────────┐
│  App     │─sync()→│PluginClient │─GET─→│   Server     │
└──────────┘      └──────┬───────┘      └──────┬───────┘
                         │                      │
                         │        Manifest      │
                         │◄─────────────────────┘
                         │
                  ┌──────▼──────┐
                  │ import(url) │
                  └──────┬──────┘
                         │
                  ┌──────▼──────────┐
                  │ Register Plugin │
                  └─────────────────┘
```

### Resource Cleanup

```
Plugin Activate                Plugin Disable
       │                             │
       ▼                             ▼
context.router.registerRoute() ─┬─→ ResourceTracker
                                 │      .cleanup(pluginId)
context.events.on(...) ─────────┤            │
                                 │            ▼
window.addEventListener(...) ───┘      Run all cleanup fns
                                             │
                                             ├─→ unregisterRoute()
                                             ├─→ events.off()
                                             └─→ removeEventListener()
```

## React Integration Architecture

```
React Component Tree
│
├─ <PluginProvider registry={manager.registry}>
│  │
│  ├─ Context: { registry, version }
│  │
│  └─ App Components
│     │
│     ├─ <PluginSlot name="toolbar" />
│     │  │
│     │  ├─ useSlotComponents('toolbar')
│     │  │  └─→ registry.getEnabled()
│     │  │      .filter(has 'toolbar' component)
│     │  │
│     │  └─ Render each component
│     │
│     └─ usePlugins() hook
│        └─→ registry.getAll()
```

**Key Concepts:**
- `PluginProvider` wraps the app with context
- `PluginSlot` queries registry for components
- Hooks provide reactive access to plugin data
- Version counter triggers re-renders on changes

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
