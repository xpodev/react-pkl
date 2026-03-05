/**
 * All UI extension points the host application exposes.
 */
export const APP_SLOTS = {
  /** Items injected into the top toolbar. */
  TOOLBAR: 'toolbar',
  /** Items injected into the left sidebar. */
  SIDEBAR: 'sidebar',
  /** Widgets added to the main dashboard grid. */
  DASHBOARD: 'dashboard',
  /** Sections added to the Settings page. */
  SETTINGS: 'settings',
} as const;

export type AppSlot = (typeof APP_SLOTS)[keyof typeof APP_SLOTS];
