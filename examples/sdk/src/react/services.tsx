import { createContext, useContext, type ReactNode } from 'react';
import type {
  NotificationService,
  RouterService,
  UserInfo,
  LoggerService,
} from '../app-context.js';

// ---------------------------------------------------------------------------
// Notification Service Context
// ---------------------------------------------------------------------------

const NotificationsContext = createContext<NotificationService | null>(null);
NotificationsContext.displayName = 'Notifications';

export function NotificationsProvider({
  value,
  children,
}: {
  value: NotificationService;
  children: ReactNode;
}) {
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

/**
 * Access the notification service from anywhere in the app or plugins.
 * Shows toast-style notifications to the user.
 */
export function useNotifications(): NotificationService {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Router Service Context
// ---------------------------------------------------------------------------

const RouterContext = createContext<RouterService | null>(null);
RouterContext.displayName = 'Router';

export function RouterProvider({
  value,
  children,
}: {
  value: RouterService;
  children: ReactNode;
}) {
  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
}

/**
 * Access the router service for navigation and route registration.
 * Plugins can use this to navigate and register custom pages.
 */
export function useRouter(): RouterService {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used within RouterProvider');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// User Context
// ---------------------------------------------------------------------------

const UserContext = createContext<UserInfo | null>(null);
UserContext.displayName = 'User';

export function UserProvider({
  value,
  children,
}: {
  value: UserInfo | null;
  children: ReactNode;
}) {
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Access the current user information.
 * Returns null if not authenticated.
 */
export function useUser(): UserInfo | null {
  return useContext(UserContext);
}

// ---------------------------------------------------------------------------
// Logger Service Context
// ---------------------------------------------------------------------------

const LoggerContext = createContext<LoggerService | null>(null);
LoggerContext.displayName = 'Logger';

export function LoggerProvider({
  value,
  children,
}: {
  value: LoggerService;
  children: ReactNode;
}) {
  return (
    <LoggerContext.Provider value={value}>
      {children}
    </LoggerContext.Provider>
  );
}

/**
 * Access the logger service for console output.
 * Logger is typically namespaced to the plugin.
 */
export function useLogger(): LoggerService {
  const ctx = useContext(LoggerContext);
  if (!ctx) {
    throw new Error('useLogger must be used within LoggerProvider');
  }
  return ctx;
}
