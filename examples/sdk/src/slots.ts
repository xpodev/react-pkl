import { createLayoutContext, createSlot } from '@react-pkl/core/react';

/**
 * Layout shape for the app.
 * Each property represents a slot where plugins can inject content.
 */
export interface AppLayout {
  /** Items injected into the top toolbar. */
  toolbar: React.ReactNode[];
  /** Items injected into the left sidebar. */
  sidebar: React.ReactNode[];
  /** Widgets added to the main dashboard grid. */
  dashboard: React.ReactNode[];
  /** Sections added to the Settings page. */
  settings: React.ReactNode[];
}

/**
 * Layout context provides global access to the app's slot state.
 * Use `useLayout()` to read the current slot contents.
 * Use `useLayoutController()` from slot providers to update the layout.
 */
export const {
  LayoutProvider: AppLayoutProvider,
  useLayout: useAppLayout,
  useLayoutController: useAppLayoutController,
} = createLayoutContext<AppLayout>();

// Create slot components for each extension point
export const {
  Provider: ToolbarSlotProvider,
  Item: ToolbarItem,
} = createSlot<AppLayout, 'toolbar'>('toolbar', useAppLayoutController);

export const {
  Provider: SidebarSlotProvider,
  Item: SidebarItem,
} = createSlot<AppLayout, 'sidebar'>('sidebar', useAppLayoutController);

export const {
  Provider: DashboardSlotProvider,
  Item: DashboardItem,
} = createSlot<AppLayout, 'dashboard'>('dashboard', useAppLayoutController);

export const {
  Provider: SettingsSlotProvider,
  Item: SettingsItem,
} = createSlot<AppLayout, 'settings'>('settings', useAppLayoutController);
