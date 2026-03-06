# API Reference

Complete API documentation for React PKL v0.2.0.

## Core Package (`@react-pkl/core`)

### PluginHost

Central controller for plugin lifecycle, theme management, and layout slots (new in v0.2.0).

#### Constructor

```typescript
constructor(context?: TContext)
```

Creates a new plugin host with an optional host context.

**Parameters:**
- `context` - The application context passed to plugins during activation

**Example:**
```typescript
const host = new PluginHost<AppContext>({
  notifications: myNotificationService,
  router: myRouter,
});
```

#### Theme Management Methods

##### `setThemePlugin(plugin: PluginModule<TContext> | null): void`

Set the active theme plugin. Only one theme can be active at a time.

**Parameters:**
- `plugin` - Theme plugin module with `onThemeEnable` method, or `null` to reset to default

**Throws:** Error if plugin doesn't have `onThemeEnable` method

**Behavior:**
1. Disables current theme (calls cleanup function and `onThemeDisable`)
2. Clears layout slot overrides
3. Enables new theme (calls `onThemeEnable` with layout slots map)
4. Stores cleanup function
5. Notifies React components to re-render

**Example:**
```typescript
import darkTheme from './dark-theme-plugin';

// Enable dark theme
host.setThemePlugin(darkTheme);

// Reset to default theme
host.setThemePlugin(null);
```

##### `getThemePlugin(): PluginModule<TContext> | null`

Get the currently active theme plugin.

```typescript
const currentTheme = host.getThemePlugin();
if (currentTheme) {
  console.log(`Active theme: ${currentTheme.meta.name}`);
}
```

##### `getLayoutSlotOverride(defaultComponent: Function): Function | null`

Get the layout override for a slot component. Returns `null` if no override is set.

**Parameters:**
- `defaultComponent` - The default layout component class/function

**Returns:** Override component or `null`

```typescript
const override = host.getLayoutSlotOverride(AppHeader);
const HeaderComponent = override || AppHeader;
```

#### Plugin Lifecycle Methods

These methods delegate to the internal PluginManager:

##### `setContext(context: TContext): void`

Set or update the host context.

```typescript
host.setContext(newContext);
```

##### `add(loader: PluginLoader<TContext>, options?: { enabled?: boolean }): Promise<void>`

Register a plugin and optionally enable it immediately.

**Parameters:**
- `loader` - Plugin module or async function that returns a plugin module
- `options.enabled` - If `true`, activates the plugin immediately (default: `false`)

**Examples:**
```typescript
// From a local module
await host.add(() => import('./my-plugin.js'), { enabled: true });

// From a plugin object
await host.add({
  meta: { id: 'my-plugin', name: 'My Plugin', version: '1.0.0' },
  activate: (ctx) => { /* ... */ },
  entrypoint: () => <MyComponent />,
});

// Lazy loading
await host.add(async () => {
  const module = await fetch('/plugins/my-plugin.js');
  return module.default;
});
```

##### `enable(id: string): Promise<void>`

Enable a plugin by ID. Calls the plugin's `activate` hook with the context.

**Throws:** Error if plugin not found

```typescript
await host.enable('com.example.plugin');
```

##### `disable(id: string): Promise<void>`

Disable a plugin without removing it. Cleans up resources and calls `deactivate` hook.

**Throws:** Error if plugin not found

```typescript
await host.disable('com.example.plugin');
```

##### `remove(id: string): Promise<void>`

Deactivate and completely remove a plugin from the registry.

```typescript
await host.remove('com.example.plugin');
```

##### `getAll(): ReadonlyArray<PluginEntry<TContext>>`

Get all registered plugins regardless of status.

```typescript
const allPlugins = host.getAll();
```

##### `getEnabled(): ReadonlyArray<PluginEntry<TContext>>`

Get only enabled plugins.

```typescript
const enabledPlugins = host.getEnabled();
```

##### `subscribe(listener: PluginEventListener): () => void`

Subscribe to plugin lifecycle events. Returns an unsubscribe function.

**Events:**
- `{ type: 'added', pluginId: string }`
- `{ type: 'removed', pluginId: string }`
- `{ type: 'enabled', pluginId: string }`
- `{ type: 'disabled', pluginId: string }`

```typescript
const unsubscribe = host.subscribe((event) => {
  console.log(`Plugin ${event.pluginId} was ${event.type}`);
});

// Later...
unsubscribe();
```

#### Internal Methods

##### `setCurrentPlugin(plugin: PluginModule<TContext> | null): void`

**Internal** - Set the currently executing plugin for resource tracking.

##### `getCurrentPlugin(): PluginModule<TContext> | null`

**Internal** - Get the currently executing plugin.

##### `trackResource(cleanup: () => void): void`

**Internal** - Register a cleanup function for the current plugin.

---

### PluginModule Interface

The structure that all plugins must conform to.

```typescript
interface PluginModule<TContext = unknown> {
  // Required metadata
  meta: PluginMeta;
  
  // Standard plugin lifecycle hooks
  activate?(context: TContext): void | Promise<void>;
  deactivate?(): void | Promise<void>;
  entrypoint?(): ReactNode;
  
  // Theme plugin hooks (new in v0.2.0)
  onThemeEnable?(slots: Map<Function, Function>): void | (() => void);
  onThemeDisable?(): void;
}
```

#### Standard Lifecycle Hooks

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

#### Standard Lifecycle Hooks

##### `activate(context: TContext): void | Promise<void>`

Called when the plugin is enabled. Receives the host application context.

```typescript
activate(context) {
  // Register routes, event listeners, etc.
  const cleanup = context.router.registerRoute({
    path: '/my-page',
    component: MyPage
  });
  
  // Track resources for automatic cleanup
  context.trackResource(cleanup);
}
```

##### `deactivate(): void | Promise<void>`

Called when the plugin is disabled. Use for cleanup (though automatic resource tracking is preferred).

```typescript
deactivate() {
  console.log('Plugin is being disabled');
}
```

##### `entrypoint(): ReactNode`

React entry point for the plugin. Returns components that register with slots.

```typescript
entrypoint() {
  return (
    <>
      <ToolbarItem>My Button</ToolbarItem>
      <SidebarItem>My Link</SidebarItem>
    </>
  );
}
```

#### Theme Lifecycle Hooks (New in v0.2.0)

##### `onThemeEnable(slots: Map<Function, Function>): void | (() => void)`

Called when this plugin is set as the active theme. Register layout component overrides in the `slots` map.

**Parameters:**
- `slots` - Map where key is default component, value is override component

**Returns:** Optional cleanup function that will be called on theme disable

```typescript
onThemeEnable(slots) {
  // Register layout overrides
  slots.set(AppHeader, DarkHeader);
  slots.set(AppSidebar, DarkSidebar);
  slots.set(AppDashboard, DarkDashboard);
  
  // Inject global styles
  const style = document.createElement('style');
  style.textContent = ':root { --bg: #000; }';
  document.head.appendChild(style);
  
  // Return cleanup function
  return () => {
    document.head.removeChild(style);
  };
}
```

##### `onThemeDisable(): void`

Called when this plugin is no longer the active theme. Use for additional cleanup (cleanup function from `onThemeEnable` is called automatically).

```typescript
onThemeDisable() {
  console.log('Theme is being disabled');
}
```

---

### PluginMeta Interface

Plugin metadata.

```typescript
interface PluginMeta {
  id: string;           // Unique identifier (e.g., 'com.example.plugin')
  name: string;         // Human-readable name
  version: string;      // Semver version
  description?: string; // Optional description
}
```

---

### Utility Functions

#### `isStaticPlugin<TContext>(plugin: PluginModule<TContext>): boolean`

Check if a plugin is "static" (doesn't have lifecycle methods). Static plugins are always available and cannot be enabled/disabled.

```typescript
import { isStaticPlugin } from '@react-pkl/core';

if (isStaticPlugin(plugin)) {
  console.log('This is a static plugin');
}
```

#### `isThemePlugin<TContext>(plugin: PluginModule<TContext>): boolean`

Check if a plugin is a theme plugin (has `onThemeEnable` method).

```typescript
import { isThemePlugin } from '@react-pkl/core';

if (isThemePlugin(plugin)) {
  host.setThemePlugin(plugin);
}
```

---

## React Integration (`@react-pkl/core/react`)

### Components

#### `<PluginProvider>`

Provides plugin context to the React tree (required as root component).

**Props:**
- `host: PluginHost<TContext>` - The plugin host instance
- `children: ReactNode` - Child components

```tsx
const host = new PluginHost(context);

<PluginProvider host={host}>
  <App />
</PluginProvider>
```

#### `<LayoutProvider>`

Provides layout context for slot management (usually wrapped by your SDK).

**Props:**
- `children: ReactNode` - Child components

```tsx
<PluginProvider host={host}>
  <LayoutProvider>
    <App />
  </LayoutProvider>
</PluginProvider>
```

#### `<Slot>`

Renders components registered for a named slot.

**Props:**
- `name: string` - The slot name
- `fallback?: ReactNode` - Rendered when no components registered

```tsx
<Slot name="toolbar" fallback={<p>No toolbar plugins</p>} />
```

#### `<LayoutSlot>`

Renders a layout component, checking for theme overrides.

**Props:**
- `default: ComponentType` - The default layout component

```tsx
<LayoutSlot default={AppHeader} />
```

Equivalent to:
```tsx
const HeaderComponent = useAppLayoutSlot(AppHeader);
<HeaderComponent />
```

#### `<PluginEntrypoints>`

Renders all plugin entrypoints. Usually placed near the root of your app.

```tsx
<PluginProvider host={host}>
  <LayoutProvider>
    <PluginEntrypoints />
    <App />
  </LayoutProvider>
</PluginProvider>
```

---

### Hooks

All hooks must be used inside appropriate providers.

#### `usePluginHost<TContext>(): PluginHost<TContext>`

Access the PluginHost instance.

**Requires:** `<PluginProvider>`

```tsx
function MyComponent() {
  const host = usePluginHost();
  
  const handleEnableDarkMode = () => {
    host.setThemePlugin(darkTheme);
  };
  
  return <button onClick={handleEnableDarkMode}>Dark Mode</button>;
}
```

#### `usePlugins<TContext>(): ReadonlyArray<PluginModule<TContext>>`

Get all registered plugin modules.

**Requires:** `<PluginProvider>`

```tsx
function PluginList() {
  const plugins = usePlugins();
  
  return (
    <ul>
      {plugins.map(plugin => (
        <li key={plugin.meta.id}>{plugin.meta.name}</li>
      ))}
    </ul>
  );
}
```

#### `useAppContext<TContext>(): TContext`

Access the host application context (defined by your SDK).

**Requires:** Custom SDK provider (usually wraps `<PluginProvider>`)

```tsx
function MyComponent() {
  const { router, notifications } = useAppContext();
  
  const navigate = () => {
    router.navigate('/settings');
  };
  
  return <button onClick={navigate}>Settings</button>;
}
```

#### `useAppLayout(): LayoutSlotContent`

Access layout slot content (toolbar, sidebar, dashboard items, etc.).

**Requires:** `<LayoutProvider>`

```tsx
function AppHeader() {
  const { toolbar } = useAppLayout();
  
  return (
    <header>
      <h1>My App</h1>
      <div className="toolbar">{toolbar}</div>
    </header>
  );
}
```

#### `useAppLayoutSlot(defaultComponent: ComponentType): ComponentType`

Get the layout component for a slot, checking for theme overrides.

**Requires:** `<LayoutProvider>` and `<PluginProvider>`

**Parameters:**
- `defaultComponent` - The default layout component

**Returns:** Override component if theme is active, otherwise default

```tsx
function MyPage() {
  const HeaderComponent = useAppLayoutSlot(AppHeader);
  
  return (
    <div>
      <HeaderComponent />
      <main>Content</main>
    </div>
  );
}
```

#### `useSlotItems(name: string): ReactNode[]`

Get all components registered for a named slot.

**Requires:** `<LayoutProvider>`

```tsx
function CustomToolbar() {
  const toolbarItems = useSlotItems('toolbar');
  
  return (
    <div className="toolbar">
      {toolbarItems.map((item, i) => (
        <div key={i}>{item}</div>
      ))}
    </div>
  );
}
```

---

### Style Context

Type-safe theming with CSS variables (usually provided by your SDK).

#### `<StyleProvider>`

Provides style variables to child components.

**Props:**
- `variables: Partial<StyleVariables>` - Style variables to provide
- `children: ReactNode` - Child components

**StyleVariables Interface:**
```typescript
interface StyleVariables {
  bgPrimary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentColor: string;
  linkColor: string;
  borderColor: string;
  cardBg: string;
  cardBgSecondary: string;
  toolbarBg: string;
  sidebarBg: string;
  borderAccent: string;
}
```

**Usage:**
```tsx
<StyleProvider variables={{ 
  bgPrimary: '#1a1a1a', 
  textPrimary: '#fff',
  accentColor: '#60a5fa'
}}>
  <MyComponent />
</StyleProvider>
```

**Cascading:** Nested providers override parent values.

```tsx
<StyleProvider variables={{ bgPrimary: '#000', textPrimary: '#fff' }}>
  <Header />
  <StyleProvider variables={{ accentColor: '#60a5fa' }}>
    <Toolbar />  {/* Inherits bgPrimary, textPrimary, overrides accent */}
  </StyleProvider>
</StyleProvider>
```

#### `useStyles(): StyleVariables`

Access style variables from the nearest `<StyleProvider>`.

```tsx
function MyComponent() {
  const styles = useStyles();
  
  return (
    <div style={{
      background: styles.bgPrimary,
      color: styles.textPrimary,
      border: `1px solid ${styles.borderColor}`
    }}>
      Content
    </div>
  );
}
```

#### `getCSSVariable(name: string, fallback?: string): string`

Read a CSS variable from the document root.

```tsx
import { getCSSVariable } from 'my-sdk';

const bgColor = getCSSVariable('--color-bg', '#ffffff');
```

#### `readStyleVariablesFromCSS(): Partial<StyleVariables>`

Read all style variables from CSS custom properties.

```tsx
import { readStyleVariablesFromCSS } from 'my-sdk';

const cssVars = readStyleVariablesFromCSS();
```

---

## SDK Helpers

These utilities help create custom slot components (usually defined in your SDK).

### `createSlot<TProps>(name: string): ComponentType<TProps>`

Create a slot component that plugins can register items to.

```typescript
import { createSlot } from '@react-pkl/core/react';

export const ToolbarItem = createSlot<{ children: ReactNode }>('toolbar');
export const SidebarItem = createSlot<{ children: ReactNode }>('sidebar');
```

Plugin usage:
```tsx
entrypoint() {
  return <ToolbarItem>My Button</ToolbarItem>;
}
```

### `createLayoutSlot<TProps>(defaultComponent: ComponentType<TProps>): ComponentType<TProps>`

Create a layout slot that theme plugins can override.

```typescript
import { createLayoutSlot } from '@react-pkl/core/react';

export const AppHeader = createLayoutSlot(() => {
  const { toolbar } = useAppLayout();
  return <header>{toolbar}</header>;
});
```

Theme plugin usage:
```typescript
onThemeEnable(slots) {
  function DarkHeader() {
    const { toolbar } = useAppLayout();
    return <header style={{ background: '#000' }}>{toolbar}</header>;
  }
  slots.set(AppHeader, DarkHeader);
}
```

---

## Type Definitions

### `PluginEntry<TContext>`

Internal plugin entry with status.

```typescript
interface PluginEntry<TContext> {
  module: PluginModule<TContext>;
  status: 'enabled' | 'disabled';
}
```

### `PluginLoader<TContext>`

Plugin loader - either a module or a function that returns one.

```typescript
type PluginLoader<TContext> =
  | PluginModule<TContext>
  | (() => PluginModule<TContext> | Promise<PluginModule<TContext>>);
```

### `PluginEvent`

Plugin lifecycle events.

```typescript
type PluginEvent =
  | { type: 'added'; pluginId: string }
  | { type: 'removed'; pluginId: string }
  | { type: 'enabled'; pluginId: string }
  | { type: 'disabled'; pluginId: string };
```

### `PluginEventListener`

Event listener function.

```typescript
type PluginEventListener = (event: PluginEvent) => void;
```

---

## SDK Package (`@react-pkl/sdk`)

Build tools for creating and bundling plugins (not changed in v0.2.0).

### `buildPlugin(options: BuildOptions): Promise<void>`

Bundle a plugin using esbuild.

**Options:**
```typescript
interface BuildOptions {
  entryPoint: string;       // Plugin entry file
  outDir: string;           // Output directory
  external?: string[];      // External dependencies
  minify?: boolean;         // Minify output (default: true)
  sourcemap?: boolean;      // Generate sourcemaps (default: true)
  target?: string;          // ES target (default: 'es2020')
}
```

**Example:**
```typescript
import { buildPlugin } from '@react-pkl/sdk';

await buildPlugin({
  entryPoint: 'src/plugin.tsx',
  outDir: 'dist',
  external: ['react', 'react-dom', 'my-sdk'],
  minify: true,
  sourcemap: true
});
```

---

## Migration from v0.1.0

### Breaking Changes

1. **PluginManager replaced by PluginHost**
   ```typescript
   // Old (v0.1.0)
   const manager = new PluginManager(context);
   <PluginProvider registry={manager.registry}>
   
   // New (v0.2.0)
   const host = new PluginHost(context);
   <PluginProvider host={host}>
   ```

2. **Layout components use hooks instead of props**
   ```tsx
   // Old (v0.1.0)
   function AppHeader({ toolbar }) {
     return <header>{toolbar}</header>;
   }
   
   // New (v0.2.0)
   function AppHeader() {
     const { toolbar } = useAppLayout();
     return <header>{toolbar}</header>;
   }
   ```

3. **Theme plugins use new lifecycle hooks**
   ```typescript
   // New (v0.2.0)
   export const darkTheme = {
     meta: { id: 'dark', name: 'Dark', version: '1.0.0' },
     onThemeEnable(slots) {
       slots.set(AppHeader, DarkHeader);
     },
     onThemeDisable() {
       // Cleanup
     }
   };
   ```

4. **Static plugins supported**
   ```typescript
   // New (v0.2.0) - no activate/deactivate needed
   export const staticPlugin = {
     meta: { id: 'static', name: 'Static', version: '1.0.0' },
     entrypoint: () => <MyComponent />
   };
   ```

### Deprecated APIs

- `PluginManager` - Use `PluginHost` instead
- `PluginClient` - Removed (use custom loading logic with `PluginHost`)
- `ResourceTracker` (standalone) - Now integrated into `PluginHost`
- `<PluginSlot>` with `componentProps` - Use context hooks instead

---

## Best Practices

1. **Use TypeScript** for full type safety
2. **Track resources** with `context.trackResource()` for automatic cleanup
3. **Use hooks** instead of prop drilling in layout components
4. **Define slots in SDK** for consistent plugin extension points
5. **Use StyleProvider** for theme variables instead of hardcoded colors
6. **Create theme plugins** with `onThemeEnable/onThemeDisable` for consistent styling
7. **Make static plugins** when no lifecycle management is needed
8. **External SDK dependencies** in plugin builds to avoid version conflicts

---

## Examples

See the [examples directory](../examples) for complete working examples:
- **examples/app** - Host application with plugin system
- **examples/plugins** - Various plugin types (standard, theme, static)
- **examples/sdk** - Custom SDK implementation

For more information, see:
- [Architecture Overview](./ARCHITECTURE)
- [Theme System Guide](./THEME_SYSTEM)
- [Getting Started](./GETTING_STARTED)


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
