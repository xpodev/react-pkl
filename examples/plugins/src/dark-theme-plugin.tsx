import { definePlugin, ToolbarItem, AppHeader, AppSidebar, AppDashboard, StyleProvider, useAppLayout } from 'example-sdk';
import { useRouter } from 'example-sdk/react';

/**
 * DarkThemePlugin
 *
 * Demonstrates:
 * - Implementing a static theme plugin (no activate/deactivate)
 * - Using onThemeEnable() and onThemeDisable() for theme lifecycle
 * - Overriding layout slot components with themed versions
 * - Applying global CSS-based theming
 * - Returning cleanup function from onThemeEnable
 * - Adding a toolbar button to show theme status
 */
const darkThemePlugin = definePlugin({
  meta: {
    id: 'example.dark-theme',
    name: 'Dark Theme',
    version: '1.0.0',
    description: 'Applies a dark color scheme to the application',
  },

  /**
   * Called when this plugin is set as the active theme.
   * Apply theme CSS and register layout slot overrides.
   * Returns a cleanup function to remove CSS when theme is disabled.
   */
  onThemeEnable(slots) {
    console.log('[DarkThemePlugin] Theme enabled');
    
    // Apply dark theme CSS variables
    applyDarkTheme();
    
    // Override layout slots with dark-themed versions
    slots.set(AppHeader, DarkHeader);
    slots.set(AppSidebar, DarkSidebar);
    slots.set(AppDashboard, DarkDashboard);
    
    // Return cleanup function
    return () => {
      console.log('[DarkThemePlugin] Theme cleanup');
      removeDarkTheme();
    };
  },

  /**
   * Called when this plugin is no longer the active theme.
   * Additional cleanup beyond what the cleanup function handles.
   */
  onThemeDisable() {
    console.log('[DarkThemePlugin] Theme disabled');
  },

  entrypoint: () => (
    <ToolbarItem>
      <ThemeIndicator />
    </ToolbarItem>
  ),
});

export default darkThemePlugin;

/**
 * Dark-themed Header component
 */
function DarkHeader() {
  const layout = useAppLayout();
  
  return (
    <StyleProvider
      variables={{
        bgPrimary: '#1a1a1a',
        textPrimary: '#e4e4e7',
        textSecondary: '#a1a1aa',
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
          marginBottom: 24,
          border: '1px solid #3f3f46',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        }}
      >
        <strong style={{ marginRight: 'auto', color: '#e4e4e7', fontSize: 16 }}>
          🌙 My App
        </strong>
        {layout.toolbar}
      </header>
    </StyleProvider>
  );
}

/**
 * Dark-themed Sidebar component
 */
function DarkSidebar() {
  const router = useRouter();
  const layout = useAppLayout();

  const handleNavigate = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    router.navigate(path);
  };

  return (
    <StyleProvider
      variables={{
        bgPrimary: '#1a1a1a',
        bgSecondary: '#27272a',
        textPrimary: '#e4e4e7',
        textSecondary: '#a1a1aa',
        textMuted: '#71717a',
        accentColor: '#60a5fa',
        borderColor: '#3f3f46',
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
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        }}
      >
      <p
        style={{
          margin: '0 0 12px',
          fontWeight: 700,
          fontSize: 13,
          color: '#a1a1aa',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Navigation
      </p>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <a
          href="/"
          onClick={handleNavigate('/')}
          style={{
            fontSize: 13,
            color: '#60a5fa',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 4,
            transition: 'background 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e: any) => {
            e.currentTarget.style.background = '#3f3f46';
          }}
          onMouseLeave={(e: any) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          🏠 Home
        </a>
        <a
          href="/settings"
          onClick={handleNavigate('/settings')}
          style={{
            fontSize: 13,
            color: '#60a5fa',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 4,
            transition: 'background 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e: any) => {
            e.currentTarget.style.background = '#3f3f46';
          }}
          onMouseLeave={(e: any) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          ⚙ Settings
        </a>
      </nav>
      <hr
        style={{
          margin: '16px 0',
          border: 'none',
          borderTop: '1px solid #3f3f46',
        }}
      />
      <p
        style={{
          margin: '0 0 12px',
          fontWeight: 700,
          fontSize: 13,
          color: '#a1a1aa',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Sidebar Plugins
      </p>
      {layout.sidebar.length === 0 ? (
        <p style={{ fontSize: 12, color: '#71717a' }}>No sidebar plugins.</p>
      ) : (
        layout.sidebar
      )}
    </aside>
    </StyleProvider>
  );
}

/**
 * Dark-themed Dashboard component
 */
function DarkDashboard() {
  const layout = useAppLayout();
  
  return (
    <StyleProvider
      variables={{
        bgPrimary: '#1a1a1a',
        bgSecondary: '#27272a',
        textPrimary: '#e4e4e7',
        textSecondary: '#a1a1aa',
        textMuted: '#71717a',
        borderColor: '#3f3f46',
        cardBg: '#27272a',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        }}
      >
      {layout.dashboard.length === 0 ? (
        <div
          style={{
            padding: 32,
            textAlign: 'center',
            background: '#27272a',
            border: '1px solid #3f3f46',
            borderRadius: 8,
            color: '#71717a',
          }}
        >
          <p style={{ margin: 0 }}>No dashboard plugins loaded.</p>
          <p style={{ margin: '8px 0 0', fontSize: 12 }}>
            Enable plugins from the panel below
          </p>
        </div>
      ) : (
        layout.dashboard
      )}
    </div>
    </StyleProvider>
  );
}

/**
 * Toolbar component showing theme status
 */
function ThemeIndicator() {
  return (
    <div
      style={{
        padding: '6px 12px',
        borderRadius: 4,
        background: '#27272a',
        color: '#e4e4e7',
        fontSize: 12,
        fontWeight: 500,
        border: '1px solid #3f3f46',
      }}
    >
      🌙 Dark Mode
    </div>
  );
}

/**
 * Apply dark theme CSS variables to the document root.
 */
function applyDarkTheme() {
  const root = document.documentElement;
  
  // Dark theme colors
  root.style.setProperty('--bg-primary', '#1a1a1a');
  root.style.setProperty('--bg-secondary', '#2d2d2d');
  root.style.setProperty('--bg-tertiary', '#404040');
  root.style.setProperty('--text-primary', '#e4e4e7');
  root.style.setProperty('--text-secondary', '#a1a1aa');
  root.style.setProperty('--text-muted', '#71717a');
  root.style.setProperty('--border-color', '#3f3f46');
  root.style.setProperty('--accent-color', '#3b82f6');
  root.style.setProperty('--accent-hover', '#2563eb');
  root.style.setProperty('--card-bg', '#27272a');
  root.style.setProperty('--toolbar-bg', '#18181b');
  root.style.setProperty('--sidebar-bg', '#27272a');
  
  // Add dark theme class to body
  document.body.classList.add('dark-theme');
  document.body.style.backgroundColor = '#1a1a1a';
  document.body.style.color = '#e4e4e7';
}

/**
 * Remove dark theme CSS variables and restore defaults.
 */
function removeDarkTheme() {
  const root = document.documentElement;
  
  // Reset to light theme colors
  root.style.removeProperty('--bg-primary');
  root.style.removeProperty('--bg-secondary');
  root.style.removeProperty('--bg-tertiary');
  root.style.removeProperty('--text-primary');
  root.style.removeProperty('--text-secondary');
  root.style.removeProperty('--text-muted');
  root.style.removeProperty('--border-color');
  root.style.removeProperty('--accent-color');
  root.style.removeProperty('--accent-hover');
  root.style.removeProperty('--card-bg');
  root.style.removeProperty('--toolbar-bg');
  root.style.removeProperty('--sidebar-bg');
  
  // Remove dark theme class from body
  document.body.classList.remove('dark-theme');
  document.body.style.backgroundColor = '';
  document.body.style.color = '';
}

