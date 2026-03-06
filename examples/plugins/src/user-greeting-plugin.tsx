import { definePlugin, DashboardItem } from 'example-sdk';
import { useAppContext } from 'example-sdk/react';

/**
 * UserGreetingPlugin
 *
 * Demonstrates:
 * - Using `useAppContext()` inside a plugin component to read the host context.
 * - Contributing a widget to the `dashboard` slot using entrypoint.
 * - No activation side-effects needed (just a pure UI extension).
 */
export default definePlugin({
  meta: {
    id: 'example.user-greeting',
    name: 'User Greeting',
    version: '1.0.0',
    description: 'Shows a personalised greeting on the dashboard.',
  },

  entrypoint: () => (
    <DashboardItem>
      <UserGreetingWidget />
    </DashboardItem>
  ),
});

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function UserGreetingWidget() {
  const { user } = useAppContext();

  if (!user) {
    return (
      <div style={cardStyle}>
        <p style={{ margin: 0, color: 'var(--text-secondary, #64748b)' }}>
          Sign in to see your personalised greeting.
        </p>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--text-primary, inherit)' }}>
        Welcome back, {user.name}!
      </h3>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary, #64748b)' }}>
        {user.email} · {user.role}
      </p>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  padding: '16px',
  borderRadius: 8,
  border: '1px solid var(--border-color, #e2e8f0)',
  background: 'var(--bg-primary, #fff)',
};
