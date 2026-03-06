import { definePlugin, ToolbarItem } from 'example-sdk';

/**
 * HelloPlugin – the simplest possible app plugin.
 *
 * Demonstrates:
 * - Minimal plugin structure with entrypoint
 * - Contributing a component to the `toolbar` slot
 */
export default definePlugin({
  meta: {
    id: 'example.hello',
    name: 'Hello Plugin',
    version: '1.0.0',
    description: 'A minimal plugin that greets the user when activated.',
  },

  activate(infra) {
    // Plugin infrastructure is available here (host, _resources, _pluginId)
    // For React hooks like notifications/logger, use them in components
    console.log('[HelloPlugin] activated');
  },

  deactivate() {
    // Nothing to clean up
    console.log('[HelloPlugin] deactivated');
  },

  entrypoint: () => (
    <ToolbarItem>
      <HelloToolbarItem />
    </ToolbarItem>
  ),
});

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function HelloToolbarItem() {
  return (
    <span
      style={{
        padding: '4px 10px',
        background: 'var(--card-bg-secondary, #e0f2fe)',
        borderRadius: 4,
        fontSize: 13,
        color: 'var(--link-color, #0369a1)',
      }}
    >
      👋 Hello Plugin
    </span>
  );
}
