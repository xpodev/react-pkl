import { definePlugin } from 'example-sdk';
import { useAppContext, PluginSlot } from 'example-sdk/react';

/**
 * CustomPagePlugin
 *
 * Demonstrates:
 * - Registering a custom route during activation
 * - Automatic route cleanup when disabled (no manual deactivate needed!)
 * - Creating a complete page with its own UI
 * - Adding navigation to the settings slot
 */
export default definePlugin({
  meta: {
    id: 'example.custom-page',
    name: 'Custom Page Plugin',
    version: '1.0.0',
    description: 'Adds a custom page accessible at /my-custom-page',
  },

  activate(context) {
    context.logger.log('[CustomPagePlugin] registering /my-custom-page route');
    
    // Register the custom route - it will be automatically cleaned up when disabled!
    context.router.registerRoute({
      path: '/my-custom-page',
      component: CustomPage,
      label: '📄 My Custom Page',
    });

    context.notifications.show('Custom Page Plugin activated!', 'success');
  },

  // No need for deactivate! Routes are automatically cleaned up by the plugin manager.
  // You can still add deactivate() for other cleanup if needed (e.g., event listeners, timers, etc.)

  components: {
    settings: CustomPageSettings,
  },
});

// ---------------------------------------------------------------------------
// CustomPage – The actual page component for the route
// ---------------------------------------------------------------------------

function CustomPage() {
  const { router, notifications } = useAppContext();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      {/* Toolbar - includes plugin components from other plugins! */}
      <header
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          padding: '8px 16px',
          background: '#f1f5f9',
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <strong style={{ marginRight: 'auto' }}>My App - Custom Page</strong>
        {/* This slot renders components from OTHER plugins */}
        <PluginSlot name="toolbar" />
      </header>

      <div style={{ padding: '16px 0', marginBottom: 24, borderBottom: '2px solid #e2e8f0' }}>
        <h1 style={{ margin: 0, fontSize: 28, color: '#1e293b' }}>
          📄 My Custom Page
        </h1>
        <p style={{ margin: '8px 0 0', color: '#64748b' }}>
          This page was added by a plugin!
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <section style={{ padding: 24, background: '#f8fafc', borderRadius: 12 }}>
          <h2 style={{ marginTop: 0, fontSize: 20 }}>Welcome to the Custom Page</h2>
          <p style={{ color: '#475569', lineHeight: 1.6 }}>
            This entire page was registered by the <strong>Custom Page Plugin</strong>.
            The plugin used the <code>context.router.registerRoute()</code> API during
            its activation phase.
          </p>
          <p style={{ color: '#475569', lineHeight: 1.6 }}>
            When the plugin is deactivated or removed, this route is automatically
            cleaned up and the page becomes inaccessible.
          </p>
        </section>

        <section style={{ padding: 24, background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe' }}>
          <h3 style={{ marginTop: 0, fontSize: 18, color: '#1e40af' }}>
            🎯 Plugin Capabilities Demo
          </h3>
          <ul style={{ color: '#1e40af', lineHeight: 1.8 }}>
            <li>Custom routes with full React components</li>
            <li>Access to the application context (router, notifications, etc.)</li>
            <li>Proper lifecycle management (activate/deactivate)</li>
            <li>Integration with the host application's navigation</li>
            <li><strong>Hosting other plugin components</strong> - Notice the toolbar above includes components from other plugins!</li>
          </ul>
        </section>

        <section style={{ padding: 24, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, fontSize: 18 }}>Try These Actions</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                router.navigate('/');
                notifications.show('Navigated to home', 'info');
              }}
              style={{
                padding: '10px 20px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                cursor: 'pointer',
                fontSize: 14,
                color: '#334155',
              }}
            >
              🏠 Go to Home
            </button>
            <button
              onClick={() => {
                router.navigate('/settings');
                notifications.show('Navigated to settings', 'info');
              }}
              style={{
                padding: '10px 20px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                cursor: 'pointer',
                fontSize: 14,
                color: '#334155',
              }}
            >
              ⚙ Go to Settings
            </button>
            <button
              onClick={() => {
                notifications.show('This is an info notification', 'info');
              }}
              style={{
                padding: '10px 20px',
                borderRadius: 6,
                border: '1px solid #3b82f6',
                background: '#eff6ff',
                cursor: 'pointer',
                fontSize: 14,
                color: '#1e40af',
              }}
            >
              💬 Show Notification
            </button>
            <button
              onClick={() => {
                notifications.show('Success! This worked great.', 'success');
              }}
              style={{
                padding: '10px 20px',
                borderRadius: 6,
                border: '1px solid #10b981',
                background: '#f0fdf4',
                cursor: 'pointer',
                fontSize: 14,
                color: '#065f46',
              }}
            >
              ✓ Show Success
            </button>
          </div>
        </section>

        <section style={{ padding: 16, background: '#fef3c7', borderRadius: 8, border: '1px solid #fbbf24' }}>
          <p style={{ margin: 0, color: '#78350f', fontSize: 14 }}>
            💡 <strong>Tip:</strong> Check the browser console to see logging from the plugin's
            activation and route registration.
          </p>
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CustomPageSettings – Appears in the Settings page
// ---------------------------------------------------------------------------

function CustomPageSettings() {
  const { router } = useAppContext();

  return (
    <section style={{ padding: 16, background: '#f8fafc', borderRadius: 8 }}>
      <h3 style={{ marginTop: 0, fontSize: 16 }}>Custom Page Plugin</h3>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 12 }}>
        This plugin adds a custom page to the application.
      </p>
      <button
        onClick={() => router.navigate('/my-custom-page')}
        style={{
          padding: '8px 16px',
          borderRadius: 6,
          border: '1px solid #3b82f6',
          background: '#eff6ff',
          cursor: 'pointer',
          fontSize: 13,
          color: '#1e40af',
        }}
      >
        📄 Visit Custom Page
      </button>
    </section>
  );
}
