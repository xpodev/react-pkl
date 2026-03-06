import { definePlugin, ToolbarItem } from 'example-sdk';
import { useNotifications, useRouter } from 'example-sdk/react';
import { useCallback } from 'react';

/**
 * SettingsShortcutPlugin
 *
 * Demonstrates:
 * - Registering / cleaning up a global keyboard shortcut in activate/deactivate
 * - Using service hooks (`useRouter`, `useNotifications`) in components
 * - Resource cleanup on plugin disable
 */
export default definePlugin({
  meta: {
    id: 'example.settings-shortcut',
    name: 'Settings Shortcut',
    version: '1.0.0',
    description:
      'Adds a toolbar button and a keyboard shortcut (Alt+,) to open Settings.',
  },

  activate(infra) {
    console.log('[SettingsShortcutPlugin] registering Alt+, shortcut');

    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === ',') {
        e.preventDefault();
        // Navigate directly without notification (can't use React hooks here)
        window.location.hash = '#/settings';
      }
    };

    window.addEventListener('keydown', handler);

    // Register cleanup with resource tracker
    infra._resources.register(infra._pluginId, () => {
      window.removeEventListener('keydown', handler);
    });
  },

  entrypoint: () => (
    <ToolbarItem>
      <SettingsToolbarButton />
    </ToolbarItem>
  ),
});

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function SettingsToolbarButton() {
  const router = useRouter();
  const notifications = useNotifications();

  const handleClick = useCallback(() => {
    router.navigate('/settings');
    notifications.show('Navigating to Settings…', 'info');
  }, [router, notifications]);

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '4px 10px',
        borderRadius: 4,
        border: '1px solid var(--border-color, #cbd5e1)',
        background: 'var(--card-bg, #f8fafc)',
        cursor: 'pointer',
        fontSize: 13,
        color: 'var(--text-primary, #334155)',
      }}
      title="Open Settings (Alt+,)"
    >
      ⚙ Settings
    </button>
  );
}