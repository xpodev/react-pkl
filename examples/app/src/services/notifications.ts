import type { NotificationService } from 'example-sdk';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

/**
 * Create a notification service with state management
 */
export function createNotificationService(
  onNotificationsChange: (notifications: Notification[]) => void
): NotificationService {
  const notifications: Notification[] = [];
  let idCounter = 0;

  return {
    show(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): string {
      const id = `notif-${++idCounter}`;
      notifications.push({ id, message, type });
      onNotificationsChange([...notifications]);

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        const index = notifications.findIndex((n) => n.id === id);
        if (index !== -1) {
          notifications.splice(index, 1);
          onNotificationsChange([...notifications]);
        }
      }, 3000);

      return id;
    },

    dismiss(id: string): void {
      const index = notifications.findIndex((n) => n.id === id);
      if (index !== -1) {
        notifications.splice(index, 1);
        onNotificationsChange([...notifications]);
      }
    },
  };
}
