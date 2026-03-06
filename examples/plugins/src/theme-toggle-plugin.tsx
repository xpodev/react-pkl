import { definePlugin, ToolbarItem } from 'example-sdk';
import { useAppContext } from 'example-sdk/react';
import { useCallback } from 'react';

/**
 * SettingsShortcutPlugin
 *
 * Demonstrates:
 * - Registering / cleaning up a global keyboard shortcut in activate/deactivate.
 * - Using `context.router` inside a toolbar component via `useAppContext()`.
 * - Using `context.notifications` to give feedback on actions.
 */
export default definePlugin({
  meta: {
    id: 'example.settings-shortcut',
    name: 'Settings Shortcut',
    version: '1.0.0',
    description:
      'Adds a toolbar button and a keyboard shortcut (Alt+,) to open Settings.',
  },

  activate(context) {
    context.logger.log('[SettingsShortcutPlugin] registering Alt+, shortcut');

    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === ',') {
        e.preventDefault();
        context.router.navigate('/settings');
        context.notifications.show('Opened Settings (Alt+,)', 'info');
      }
    };

    window.addEventListener('keydown', handler);

    // Store the handler so deactivate can remove it.
    // Using a module-level ref is intentional here – plugins are singletons.
    _keydownHandler = handler;
  },

  deactivate() {
    if (_keydownHandler) {
      window.removeEventListener('keydown', _keydownHandler);
      _keydownHandler = null;
    }
  },

  entrypoint: () => (
    <ToolbarItem>
      <SettingsToolbarButton />
    </ToolbarItem>
  ),
});

// Module-level handle for the keyboard listener (plugin is a singleton).
let _keydownHandler: ((e: KeyboardEvent) => void) | null = null;

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function SettingsToolbarButton() {
  const { router, notifications } = useAppContext();

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
