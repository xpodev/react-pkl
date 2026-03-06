import { definePlugin, SettingsItem } from 'example-sdk';
import { useNotifications, useRouter } from 'example-sdk/react';

/**
 * CustomPagePlugin
 *
 * Demonstrates:
 * - Using service hooks (notifications, router) in components
 * - Adding interactive UI to the settings slot
 * - How plugins can access app services without monolithic context
 */
export default definePlugin({
  meta: {
    id: 'example.custom-page',
    name: 'Plugin Actions Demo',
    version: '1.0.0',
    description: 'Demonstrates using service hooks in plugin components',
  },

  activate(infra) {
    console.log('[PluginActionsDemo] activated');
  },

  entrypoint: () => (
    <SettingsItem>
      <PluginActionsWidget />
    </SettingsItem>
  ),
});

// ---------------------------------------------------------------------------
// PluginActionsWidget – Demonstrates service hook usage
// ---------------------------------------------------------------------------

function PluginActionsWidget() {
  const notifications = useNotifications();
  const router = useRouter();

  return (
    <div style={{ padding: 24, background: 'var(--card-bg, #f8fafc)', borderRadius: 12 }}>
      <h3 style={{ marginTop: 0, fontSize: 18, color: 'var(--text-primary, inherit)' }}>
        🎯 Plugin Actions Demo
      </h3>
      <p style={{ color: 'var(--text-secondary, #64748b)', marginBottom: 16, lineHeight: 1.6 }}>
        This widget demonstrates how plugins use service hooks to access app functionality.
        Each button below uses a different service hook.
      </p>
      
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            router.navigate('/');
            notifications.show('Navigated to home', 'info');
          }}
          style={{
            padding: '10px 20px',
            borderRadius: 6,
            border: '1px solid var(--border-color, #cbd5e1)',
            background: 'var(--card-bg, white)',
            cursor: 'pointer',
            fontSize: 14,
            color: 'var(--text-primary, #334155)',
          }}
        >
          🏠 Go to Home
        </button>
        
        <button
          onClick={() => {
            notifications.show('This is an info notification', 'info');
          }}
          style={{
            padding: '10px 20px',
            borderRadius: 6,
            border: '1px solid var(--border-accent, #3b82f6)',
            background: 'var(--card-bg-secondary, #eff6ff)',
            cursor: 'pointer',
            fontSize: 14,
            color: 'var(--text-accent, #1e40af)',
          }}
        >
          ℹ️ Info Notification
        </button>
        
        <button
          onClick={() => {
            notifications.show('Success! This worked great.', 'success');
          }}
          style={{
            padding: '10px 20px',
            borderRadius: 6,
            border: '1px solid #86efac',
            background: '#f0fdf4',
            cursor: 'pointer',
            fontSize: 14,
            color: '#15803d',
          }}
        >
          ✅ Success Notification
        </button>
        
        <button
          onClick={() => {
            notifications.show('Warning: Something needs attention', 'warning');
          }}
          style={{
            padding: '10px 20px',
            borderRadius: 6,
            border: '1px solid #fde047',
            background: '#fefce8',
            cursor: 'pointer',
            fontSize: 14,
            color: '#a16207',
          }}
        >
          ⚠ Warning Notification
        </button>
        
        <button
          onClick={() => {
            notifications.show('Error: Something went wrong', 'error');
          }}
          style={{
            padding: '10px 20px',
            borderRadius: 6,
            border: '1px solid #fca5a5',
            background: '#fef2f2',
            cursor: 'pointer',
            fontSize: 14,
            color: '#b91c1c',
          }}
        >
          ❌ Error Notification
        </button>
      </div>
      
      <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-info, #eff6ff)', borderRadius: 6, fontSize: 13, color: 'var(--text-info, #1e40af)' }}>
        <strong>Note:</strong> Each button uses React hooks (<code>useNotifications()</code> and <code>useRouter()</code>) 
        to access app services. Plugins don't need a monolithic context - they opt-in to only the services they need!
      </div>
    </div>
  );
}
