import { createContext, useContext, type ReactNode } from 'react';

/**
 * StyleVariables - CSS variable values for consistent theming
 * 
 * These values should match CSS custom properties set by theme plugins.
 * Provides type-safe access to theme colors and other style variables.
 */
export interface StyleVariables {
  // Background colors
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // UI colors
  borderColor: string;
  accentColor: string;
  accentHover: string;
  
  // Component backgrounds
  cardBg: string;
  toolbarBg: string;
  sidebarBg: string;
}

/**
 * Default light theme style variables
 */
export const defaultStyleVariables: StyleVariables = {
  bgPrimary: '#ffffff',
  bgSecondary: '#f8fafc',
  bgTertiary: '#f1f5f9',
  
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  
  borderColor: '#e2e8f0',
  accentColor: '#0369a1',
  accentHover: '#0284c7',
  
  cardBg: '#f8fafc',
  toolbarBg: '#f1f5f9',
  sidebarBg: '#f8fafc',
};

/**
 * Context for accessing style variables
 */
const StyleContext = createContext<StyleVariables>(defaultStyleVariables);

export interface StyleProviderProps {
  /**
   * Style variables to provide to components.
   * If not provided, uses default light theme values.
   */
  variables?: Partial<StyleVariables>;
  children: ReactNode;
}

/**
 * StyleProvider - provides style variables to the component tree
 * 
 * Theme plugins can wrap their components with this provider to override
 * style variables for their themed components.
 * 
 * @example
 * ```tsx
 * // In theme plugin's layout override
 * function DarkHeader() {
 *   return (
 *     <StyleProvider variables={{
 *       bgPrimary: '#1a1a1a',
 *       textPrimary: '#e4e4e7',
 *       accentColor: '#3b82f6',
 *     }}>
 *       <header>...</header>
 *     </StyleProvider>
 *   );
 * }
 * ```
 */
export function StyleProvider({ variables, children }: StyleProviderProps) {
  const parentVariables = useContext(StyleContext);
  const mergedVariables = { ...parentVariables, ...variables };
  
  return (
    <StyleContext.Provider value={mergedVariables}>
      {children}
    </StyleContext.Provider>
  );
}

/**
 * useStyles - hook to access style variables in components
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const styles = useStyles();
 *   return (
 *     <div style={{ color: styles.textPrimary, background: styles.bgPrimary }}>
 *       Hello
 *     </div>
 *   );
 * }
 * ```
 */
export function useStyles(): StyleVariables {
  return useContext(StyleContext);
}

/**
 * Get CSS custom property value from the computed style of an element.
 * Useful for reading theme variables set by CSS.
 * 
 * @param propertyName - CSS custom property name (e.g., '--text-primary')
 * @param element - Element to read from (defaults to document.documentElement)
 */
export function getCSSVariable(
  propertyName: string,
  element: HTMLElement = document.documentElement
): string {
  return getComputedStyle(element).getPropertyValue(propertyName).trim();
}

/**
 * Read all style variables from CSS custom properties.
 * Useful for syncing CSS variables with React context.
 */
export function readStyleVariablesFromCSS(): StyleVariables {
  return {
    bgPrimary: getCSSVariable('--bg-primary') || defaultStyleVariables.bgPrimary,
    bgSecondary: getCSSVariable('--bg-secondary') || defaultStyleVariables.bgSecondary,
    bgTertiary: getCSSVariable('--bg-tertiary') || defaultStyleVariables.bgTertiary,
    textPrimary: getCSSVariable('--text-primary') || defaultStyleVariables.textPrimary,
    textSecondary: getCSSVariable('--text-secondary') || defaultStyleVariables.textSecondary,
    textMuted: getCSSVariable('--text-muted') || defaultStyleVariables.textMuted,
    borderColor: getCSSVariable('--border-color') || defaultStyleVariables.borderColor,
    accentColor: getCSSVariable('--accent-color') || defaultStyleVariables.accentColor,
    accentHover: getCSSVariable('--accent-hover') || defaultStyleVariables.accentHover,
    cardBg: getCSSVariable('--card-bg') || defaultStyleVariables.cardBg,
    toolbarBg: getCSSVariable('--toolbar-bg') || defaultStyleVariables.toolbarBg,
    sidebarBg: getCSSVariable('--sidebar-bg') || defaultStyleVariables.sidebarBg,
  };
}
