import { definePlugin, ToolbarItem } from 'example-sdk';

/**
 * HelloPlugin – the simplest possible app plugin.
 *
 * Demonstrates:
 * - Using `context.logger` and `context.notifications` in `activate`.
 * - Contributing a component to the `toolbar` slot using entrypoint.
 */
export default definePlugin({
  meta: {
    id: 'example.hello',
    name: 'Hello Plugin',
    version: '1.0.0',
    description: 'A minimal plugin that greets the user when activated.',
  },

  activate(context) {
    context.logger.log('[HelloPlugin] activated');
    context.notifications.show('Hello Plugin is active!', 'success');
  },

  deactivate() {
    // Nothing to clean up, but showing the hook exists.
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
        background: '#e0f2fe',
        borderRadius: 4,
        fontSize: 13,
        color: '#0369a1',
      }}
    >
      👋 Hello Plugin
    </span>
  );
}
