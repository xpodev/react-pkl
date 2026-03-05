# API Reference

Complete API documentation for React PKL.

## Core Package (`@react-pkl/core`)

### PluginManager

Standalone mode plugin manager with full lifecycle control.

#### Constructor

```typescript
constructor(context?: TContext)
```

Creates a new plugin manager with an optional host context.

**Parameters:**
- `context` - The application context passed to plugins during activation

**Example:**
```typescript
const manager = new PluginManager<AppContext>({
  notifications: myNotificationService,
  router: myRouter,
});
```

#### Methods

##### `setContext(context: TContext): void`

Set or update the host context. Can be called before or after plugins are added.

```typescript
manager.setContext(newContext);
```

##### `add(loader: PluginLoader<TContext>, options?: { enabled?: boolean }): Promise<void>`

Register a plugin and optionally enable it immediately.

**Parameters:**
- `loader` - Plugin module or async function that returns a plugin module
- `options.enabled` - If `true`, activates the plugin immediately (default: `false`)

**Examples:**
```typescript
// From a local module
await manager.add(() => import('./my-plugin.js'), { enabled: true });

// From a plugin object
await manager.add({
  meta: { id: 'my-plugin', name: 'My Plugin', version: '1.0.0' },
  activate: (ctx) => { /* ... */ },
  components: { toolbar: MyComponent },
});

// Lazy loading
await manager.add(async () => {
  const module = await fetch('/plugins/my-plugin.js');
  return module.default;
});
```

##### `enable(id: string): Promise<void>`

Enable a plugin by ID. Calls the plugin's `activate` hook with the context.

**Throws:** Error if plugin not found

```typescript
await manager.enable('com.example.plugin');
```

##### `disable(id: string): Promise<void>`

Disable a plugin without removing it. Cleans up resources and calls `deactivate` hook.

**Throws:** Error if plugin not found

```typescript
await manager.disable('com.example.plugin');
```

##### `remove(id: string): Promise<void>`

Deactivate and completely remove a plugin from the registry.

```typescript
await manager.remove('com.example.plugin');
```

##### `getAll(): ReadonlyArray<PluginEntry<TContext>>`

Get all registered plugins regardless of status.

```typescript
const allPlugins = manager.getAll();
```

##### `getEnabled(): ReadonlyArray<PluginEntry<TContext>>`

Get only enabled plugins.

```typescript
const enabledPlugins = manager.getEnabled();
```

##### `subscribe(listener: PluginEventListener): () => void`

Subscribe to plugin lifecycle events. Returns an unsubscribe function.

**Events:**
- `{ type: 'added', pluginId: string }`
- `{ type: 'removed', pluginId: string }`
- `{ type: 'enabled', pluginId: string }`
- `{ type: 'disabled', pluginId: string }`

```typescript
const unsubscribe = manager.subscribe((event) => {
  console.log(`Plugin ${event.pluginId} was ${event.type}`);
});

// Later...
unsubscribe();
```

#### Properties

##### `registry: PluginRegistry<TContext>`

Access to the underlying plugin registry. Use this for React integration.

```typescript
<PluginProvider registry={manager.registry}>
  {/* ... */}
</PluginProvider>
```

##### `resources: ResourceTracker`

Access to the resource tracker for manual resource management.

```typescript
manager.resources.register('my-plugin', () => {
  console.log('Cleanup!');
});
```

---

### PluginClient

Client mode for fetching plugins from a remote source.

#### Constructor

```typescript
constructor(
  options: PluginClientOptions<TContext>,
  registry?: PluginRegistry<TContext>
)
```

**Options:**
- `manifestUrl` (required) - URL of the remote plugin manifest
- `context` - Host context passed to plugins
- `fetch` - Custom fetch implementation (defaults to `globalThis.fetch`)

**Example:**
```typescript
const client = new PluginClient({
  manifestUrl: 'https://api.example.com/plugins/manifest.json',
  context: myAppContext,
});
```

#### Methods

##### `sync(): Promise<void>`

Fetch the manifest and load all plugins. New plugins are added and activated.

```typescript
await client.sync();
```

##### `getAll(): ReadonlyArray<PluginEntry<TContext>>`

Get all loaded plugins.

##### `getEnabled(): ReadonlyArray<PluginEntry<TContext>>`

Get only enabled plugins.

##### `subscribe(listener: PluginEventListener): () => void`

Subscribe to plugin events.

#### Properties

##### `registry: PluginRegistry<TContext>`

Access to the underlying registry.

---

### ResourceTracker

Manages automatic cleanup of plugin resources.

#### Methods

##### `register(pluginId: string, cleanup: CleanupFunction): void`

Register a cleanup function for a plugin.

```typescript
resources.register('my-plugin', () => {
  window.removeEventListener('resize', handler);
});
```

##### `cleanup(pluginId: string): void`

Run all cleanup functions for a plugin. Called automatically by PluginManager.

```typescript
resources.cleanup('my-plugin');
```

##### `has(pluginId: string): boolean`

Check if a plugin has registered resources.

```typescript
if (resources.has('my-plugin')) {
  console.log('Plugin has resources');
}
```

---

### PluginRegistry

Low-level storage for plugin entries. Usually not accessed directly.

#### Methods

##### `has(id: string): boolean`

Check if a plugin is registered.

##### `get(id: string): PluginEntry<TContext> | undefined`

Get a plugin entry by ID.

##### `getAll(): ReadonlyArray<PluginEntry<TContext>>`

Get all plugin entries.

##### `getEnabled(): ReadonlyArray<PluginEntry<TContext>>`

Get enabled plugin entries.

##### `add(module: PluginModule<TContext>, status?: PluginStatus): void`

Add a plugin module.

##### `remove(id: string): void`

Remove a plugin by ID.

##### `setStatus(id: string, status: PluginStatus): void`

Change a plugin's status.

##### `subscribe(listener: PluginEventListener): () => void`

Subscribe to registry events.

---

## React Integration (`@react-pkl/core/react`)

### Components

#### `<PluginProvider>`

Provides plugin context to the React tree.

**Props:**
- `registry: PluginRegistry<TContext>` - The plugin registry to use
- `children: ReactNode` - Child components

```tsx
<PluginProvider registry={manager.registry}>
  <App />
</PluginProvider>
```

#### `<PluginSlot>`

Renders plugin components registered for a slot.

**Props:**
- `name: string` - The slot name
- `componentProps?: Record<string, any>` - Props passed to each component
- `fallback?: ReactNode` - Rendered when no plugins provide components

```tsx
<PluginSlot 
  name="toolbar" 
  componentProps={{ theme: 'dark' }}
  fallback={<p>No toolbar plugins</p>}
/>
```

### Hooks

All hooks must be used inside a `<PluginProvider>`.

#### `usePlugins<TContext>()`

Returns all registered plugin entries.

```tsx
const plugins = usePlugins<AppContext>();
```

**Returns:** `ReadonlyArray<PluginEntry<TContext>>`

#### `useEnabledPlugins<TContext>()`

Returns only enabled plugin entries.

```tsx
const enabledPlugins = useEnabledPlugins<AppContext>();
```

**Returns:** `ReadonlyArray<PluginEntry<TContext>>`

#### `usePlugin<TContext>(id: string)`

Returns a specific plugin entry by ID.

```tsx
const plugin = usePlugin<AppContext>('com.example.hello');
```

**Returns:** `PluginEntry<TContext> | undefined`

#### `usePluginMeta()`

Returns metadata for all plugins (lighter weight than `usePlugins`).

```tsx
const metaList = usePluginMeta();
// [{ id: '...', name: '...', version: '...' }, ...]
```

**Returns:** `ReadonlyArray<PluginMeta>`

#### `useSlotComponents(slot: string)`

Returns all components registered for a slot.

```tsx
const toolbarComponents = useSlotComponents('toolbar');
```

**Returns:** `ReadonlyArray<ComponentType<unknown>>`

---

## SDK Package (`@react-pkl/sdk`)

### `buildPlugin(config: PluginBuildConfig): Promise<PluginBuildResult>`

Bundle a plugin using esbuild.

**Config:**
```typescript
interface PluginBuildConfig<TMeta = unknown> {
  // Required
  entry: string;              // Entry point file path
  outDir: string;             // Output directory
  meta: TMeta;                // Plugin metadata

  // Optional
  formats?: Array<'esm' | 'cjs'>; // Output formats (default: ['esm'])
  minify?: boolean;           // Minify output (default: false)
  sourcemap?: boolean;        // Generate sourcemaps (default: true)
  external?: string[];        // External dependencies (react/react-dom always external)
  esbuildPlugins?: Plugin[];  // Custom esbuild plugins
  generateMetadata?: MetadataGenerator<TMeta>; // Generate custom metadata
  metadataFileName?: string;  // Metadata file name (default: 'meta.json')
}
```

**Result:**
```typescript
interface PluginBuildResult<TMeta = unknown> {
  outDir: string;           // Resolved output directory
  outputFiles: string[];    // Array of generated file paths
  metadata?: TMeta;         // Generated metadata (if generateMetadata provided)
}
```

**Example:**
```typescript
import { buildPlugin } from '@react-pkl/sdk';

const result = await buildPlugin({
  entry: './src/index.tsx',
  outDir: './dist',
  meta: {
    id: 'com.example.plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'A sample plugin',
  },
  formats: ['esm'],
  minify: true,
  generateMetadata: async (meta, outDir) => {
    const stats = await getDirectoryStats(outDir);
    return {
      ...meta,
      buildTime: new Date().toISOString(),
      size: stats.totalSize,
    };
  },
});

console.log('Built:', result.outputFiles);
```

---

## Type Definitions

### `PluginMeta`

Static metadata about a plugin.

```typescript
interface PluginMeta {
  readonly id: string;          // Unique identifier
  readonly name: string;        // Human-readable name
  readonly version: string;     // Semver version
  readonly description?: string; // Optional description
}
```

### `PluginModule<TContext>`

The runtime export of a plugin bundle.

```typescript
interface PluginModule<TContext = unknown> {
  readonly meta: PluginMeta;
  activate?(context: TContext): void | Promise<void>;
  deactivate?(): void | Promise<void>;
  components?: Readonly<Record<string, ComponentType<any>>>;
}
```

### `PluginEntry<TContext>`

Internal representation of a registered plugin.

```typescript
interface PluginEntry<TContext = unknown> {
  readonly module: PluginModule<TContext>;
  status: PluginStatus; // 'enabled' | 'disabled'
}
```

### `PluginLoader<TContext>`

Plugin module or factory function.

```typescript
type PluginLoader<TContext = unknown> =
  | PluginModule<TContext>
  | (() => PluginModule<TContext> | Promise<PluginModule<TContext>>);
```

### `RemotePluginDescriptor`

Server-side plugin manifest entry.

```typescript
interface RemotePluginDescriptor {
  readonly meta: PluginMeta;
  readonly url: string; // URL to plugin bundle
}
```

### `PluginEvent`

Plugin lifecycle event.

```typescript
type PluginEvent =
  | { type: 'added'; pluginId: string }
  | { type: 'removed'; pluginId: string }
  | { type: 'enabled'; pluginId: string }
  | { type: 'disabled'; pluginId: string };
```

### `CleanupFunction`

Function called to clean up plugin resources.

```typescript
type CleanupFunction = () => void;
```
