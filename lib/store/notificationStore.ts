import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  href: string;
  read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotifications: (incoming: AppNotification[]) => void;
  markAllRead: () => void;
  unreadCount: number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotifications: (incoming) => {
        const existing = get().notifications;
        const existingIds = new Set(existing.map((n) => n.id));
        const fresh = incoming.filter((n) => !existingIds.has(n.id));
        if (fresh.length === 0) return;
        const merged = [...fresh, ...existing].slice(0, 50); // keep latest 50
        set({
          notifications: merged,
          unreadCount: merged.filter((n) => !n.read).length,
        });
      },

      markAllRead: () => {
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },
    }),
    { name: 'ensias-hub-notifications' }
  )
);
