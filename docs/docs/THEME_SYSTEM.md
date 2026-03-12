---
sidebar_position: 7
title: Theme System
---

# React PKL v0.2.0 - Theme System Documentation

This guide covers the v0.2.0 theme system features and how to create theme plugins.

## Table of Contents

1. [Overview](#overview)
2. [Theme Plugin Lifecycle](#theme-plugin-lifecycle)
3. [Layout Slot Overrides](#layout-slot-overrides)
4. [Style Context](#style-context)
5. [Static vs Dynamic Plugins](#static-vs-dynamic-plugins)
6. [Complete Example](#complete-example)

## Overview

The v0.2.0 architecture introduces a powerful theme system that allows plugins to:

- Override entire layout components (header, sidebar, dashboard, etc.)
- Provide type-safe style variables through React context
- Manage theme lifecycle independently from plugin activation
- Work as "static plugins" without activate/deactivate methods
- Persist theme selection across sessions

## Theme Plugin Lifecycle

Theme plugins use two special lifecycle methods:

### `onThemeEnable(slots: Map<Function, Function>)`

Called when the plugin is set as the active theme.

**Parameters:**
- `slots` - A Map where keys are default layout components and values are replacement components

**Returns:**
- Optional cleanup function that will be called when theme is disabled

**Example:**
```typescript
onThemeEnable(slots) {
  // Apply CSS variables
  document.documentElement.style.setProperty('--bg-primary', '#1a1a1a');
  
  // Override layout components
  slots.set(AppHeader, DarkHeader);
  slots.set(AppSidebar, DarkSidebar);
  
  // Return cleanup function
  return () => {
    document.documentElement.style.removeProperty('--bg-primary');
  };
}
```

### `onThemeDisable()`

Called when the plugin is no longer the active theme. Use for additional cleanup beyond what the cleanup function handles.

**Example:**
```typescript
onThemeDisable() {
  console.log('Theme disabled');
  // Additional cleanup if needed
}
```

## Layout Slot Overrides

Layout slots are components that can be replaced by theme plugins. They're created using `createLayoutSlot()`:

### Defining Layout Slots

In your SDK:

```typescript
// sdk/src/layout-slots.tsx
import { createLayoutSlot } from '@pkl.js/react/react';

export const AppHeader = createLayoutSlot<{ toolbar: React.ReactNode[] }>(
  function DefaultHeader({ toolbar }) {
    return <header>{toolbar}</header>;
  }
);

export const AppSidebar = createLayoutSlot<{
  pluginRoutes: Map<string, PluginRoute>;
  sidebarItems: React.ReactNode[];
  Link: any;
}>(
  function DefaultSidebar({ pluginRoutes, sidebarItems, Link }) {
    return <aside>{sidebarItems}</aside>;
  }
);
```

### Using Layout Slots

In your app:

```tsx
import { AppHeader, AppSidebar } from 'my-sdk';

function PageLayout() {
  return (
    <div>
      <AppHeader toolbar={toolbar} />
      <AppSidebar pluginRoutes={routes} sidebarItems={items} Link={Link} />
    </div>
  );
}
```

### Overriding Layout Slots

In theme plugin:

```typescript
onThemeEnable(slots) {
  slots.set(AppHeader, CustomHeader);
  slots.set(AppSidebar, CustomSidebar);
}

{% raw %}
function CustomHeader({ toolbar }) {
  return (
    <header style={{ background: 'linear-gradient(...)' }}>
      {toolbar}
    </header>
  );
}
{% endraw %}
```

## Style Context

The style context provides type-safe access to theme variables.

### StyleProvider

Wrap components to provide style variables:

```tsx
import { StyleProvider } from 'my-sdk';

{% raw %}
function DarkHeader({ toolbar }) {
  return (
    <StyleProvider
      variables={{
        bgPrimary: '#1a1a1a',
        textPrimary: '#e4e4e7',
        accentColor: '#60a5fa',
        borderColor: '#3f3f46',
      }}
    >
      <header>{toolbar}</header>
    </StyleProvider>
  );
}
{% endraw %}
```

### useStyles Hook

Access style variables in components:

```tsx
import { useStyles } from 'my-sdk';

{% raw %}
function MyComponent() {
  const styles = useStyles();
  
  return (
    <div style={{
      background: styles.bgPrimary,
      color: styles.textPrimary,
      border: `1px solid ${styles.borderColor}`,
    }}>
      Content
    </div>
  );
}
{% endraw %}
```

### Default Style Variables

The SDK provides default light theme variables:

```typescript
export interface StyleVariables {
  bgPrimary: string;      // '#ffffff'
  bgSecondary: string;    // '#f8fafc'
  bgTertiary: string;     // '#f1f5f9'
  textPrimary: string;    // '#0f172a'
  textSecondary: string;  // '#64748b'
  textMuted: string;      // '#94a3b8'
  borderColor: string;    // '#e2e8f0'
  accentColor: string;    // '#0369a1'
  accentHover: string;    // '#0284c7'
  cardBg: string;         // '#f8fafc'
  toolbarBg: string;      // '#f1f5f9'
  sidebarBg: string;      // '#f8fafc'
}
```

### Reading CSS Variables

Sync CSS custom properties with context:

```typescript
import { readStyleVariablesFromCSS } from 'my-sdk';

const styles = readStyleVariablesFromCSS();
// Returns StyleVariables object with values from CSS
```

## Static vs Dynamic Plugins

### Static Plugins

Plugins without `activate` and `deactivate` methods:

```typescript
const themePlugin = definePlugin({
  meta: {
    id: 'my-theme',
    name: 'My Theme',
    version: '1.0.0',
  },
  
  // No activate/deactivate - this is a static plugin
  
  onThemeEnable(slots) {
    // Only activates when set as theme
  },
  
  onThemeDisable() {
    // Only deactivates when removed as theme
  },
});
```

**Benefits:**
- Always available without being "enabled"
- Perfect for themes that don't need app integration
- Can't be toggled on/off in plugin manager
- Lighter weight, no lifecycle overhead

### Dynamic Plugins

Plugins with lifecycle methods:

```typescript
const dataPlugin = definePlugin({
  meta: { /* ... */ },
  
  async activate(context) {
    // Runs when plugin is enabled
    await context.api.connect();
  },
  
  async deactivate() {
    // Runs when plugin is disabled
    await context.api.disconnect();
  },
});
```

### Type Checking

Use helper functions to identify plugin types:

```typescript
import { isStaticPlugin, isThemePlugin } from '@pkl.js/react';

if (isStaticPlugin(plugin)) {
  // Plugin has no activate/deactivate
}

if (isThemePlugin(plugin)) {
  // Plugin has onThemeEnable
  pluginHost.setThemePlugin(plugin);
}
```

## Complete Example

Here's a complete dark theme plugin:

```typescript
// dark-theme-plugin.tsx
import { 
  definePlugin, 
  ToolbarItem,
  AppHeader, 
  AppSidebar, 
  AppDashboard,
  StyleProvider 
} from 'my-sdk';

const darkThemePlugin = definePlugin({
  meta: {
    id: 'com.example.dark-theme',
    name: 'Dark Theme',
    version: '1.0.0',
    description: 'Applies a dark color scheme to the application',
  },

  // No activate/deactivate - static plugin
  
  onThemeEnable(slots) {
    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--bg-primary', '#1a1a1a');
    root.style.setProperty('--text-primary', '#e4e4e7');
    root.style.setProperty('--accent-color', '#60a5fa');
    root.style.setProperty('--border-color', '#3f3f46');
    
    // Override layout slots
    slots.set(AppHeader, DarkHeader);
    slots.set(AppSidebar, DarkSidebar);
    slots.set(AppDashboard, DarkDashboard);
    
    // Return cleanup function
    return () => {
      root.style.removeProperty('--bg-primary');
      root.style.removeProperty('--text-primary');
      root.style.removeProperty('--accent-color');
      root.style.removeProperty('--border-color');
    };
  },
  
  onThemeDisable() {
    console.log('Dark theme disabled');
  },
  
  entrypoint: () => (
    <ToolbarItem>
      <span style={{ padding: '4px 8px', background: '#27272a' }}>
        🌙 Dark Mode
      </span>
    </ToolbarItem>
  ),
});

{% raw %}
function DarkHeader({ toolbar }: { toolbar: React.ReactNode[] }) {
  return (
    <StyleProvider
      variables={{
        bgPrimary: '#1a1a1a',
        textPrimary: '#e4e4e7',
        accentColor: '#60a5fa',
        toolbarBg: '#18181b',
      }}
    >
      <header
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
          borderRadius: 8,
          border: '1px solid #3f3f46',
        }}
      >
        <strong style={{ marginRight: 'auto', color: '#e4e4e7' }}>
          🌙 My App
        </strong>
        {toolbar}
      </header>
    </StyleProvider>
  );
}

function DarkSidebar({ pluginRoutes, sidebarItems, Link }) {
  return (
    <StyleProvider
      variables={{
        bgPrimary: '#1a1a1a',
        textPrimary: '#e4e4e7',
        accentColor: '#60a5fa',
        sidebarBg: '#27272a',
      }}
    >
      <aside
        style={{
          width: 220,
          background: 'linear-gradient(180deg, #27272a 0%, #18181b 100%)',
          borderRadius: 8,
          padding: 16,
          border: '1px solid #3f3f46',
        }}
      >
        {/* Sidebar content */}
      </aside>
    </StyleProvider>
  );
}

function DarkDashboard({ dashboardItems }) {
  return (
    <StyleProvider
      variables={{
        bgPrimary: '#1a1a1a',
        cardBg: '#27272a',
        borderColor: '#3f3f46',
      }}
    >
      <div style={{ display: 'grid', gap: 16 }}>
        {dashboardItems}
      </div>
    </StyleProvider>
  );
}
{% endraw %}

export default darkThemePlugin;
```

### Using the Theme

In your app:

```tsx
import { PluginHost } from '@pkl.js/react';
import { isThemePlugin } from '@pkl.js/react';
import { darkThemePlugin } from 'my-plugins';

// Add the theme plugin
await pluginHost.getManager().add(darkThemePlugin);

// Set as active theme
pluginHost.setThemePlugin(darkThemePlugin);

// Save to localStorage
localStorage.setItem('active-theme', darkThemePlugin.meta.id);

// Restore from localStorage
const savedThemeId = localStorage.getItem('active-theme');
const allPlugins = pluginHost.getRegistry().getAll();
const themePlugin = allPlugins
  .map(e => e.module)
  .find(p => p.meta.id === savedThemeId && isThemePlugin(p));

if (themePlugin) {
  pluginHost.setThemePlugin(themePlugin);
}
```

## Best Practices

1. **Use CSS Variables**: Apply theme colors via CSS custom properties for maximum flexibility
2. **Return Cleanup Functions**: Always return a cleanup function from `onThemeEnable` to properly teardown
3. **Wrap with StyleProvider**: Provide style context to your themed components
4. **Keep Themes Static**: Theme-only plugins should be static (no activate/deactivate)
5. **Persist Selection**: Save active theme to localStorage for better UX
6. **Fallback Gracefully**: Always provide default values in case theme isn't set
7. **Test Theme Switching**: Ensure proper cleanup when switching between themes
8. **Mind the Performance**: Keep theme overrides lightweight, avoid heavy computations

## Migration from v0.1.0

If you have existing plugins using the old `layout()` method:

**Before (v0.1.0):**
```typescript
layout(slots) {
  slots.set(AppHeader, DarkHeader);
}
```

**After (v0.2.0):**
```typescript
onThemeEnable(slots) {
  // Apply theme
  slots.set(AppHeader, DarkHeader);
  
  // Return cleanup
  return () => {
    // Cleanup theme
  };
}

onThemeDisable() {
  // Additional cleanup
}
```

## API Reference

### PluginHost

- `setThemePlugin(plugin: PluginModule | null)` - Set active theme
- `getThemePlugin(): PluginModule | null` - Get current theme
- `getLayoutSlotOverride(component: Function): Function | null` - Get override for slot

### Helper Functions

- `isStaticPlugin(plugin)` - Check if plugin has no lifecycle methods
- `isThemePlugin(plugin)` - Check if plugin has onThemeEnable
- `createLayoutSlot<TProps>(DefaultComponent)` - Create themeable layout slot

### Style Context

- `<StyleProvider variables={...}>` - Provide style variables
- `useStyles()` - Access style variables
- `getCSSVariable(name)` - Read CSS custom property
- `readStyleVariablesFromCSS()` - Get all variables from CSS
