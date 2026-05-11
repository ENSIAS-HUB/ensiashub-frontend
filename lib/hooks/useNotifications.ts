'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPendingReviews } from '@/lib/api/drive';
import { getGroupRequests } from '@/lib/api/groups';
import { useAuthStore } from '@/lib/store/authStore';
import { useNotificationStore, type AppNotification } from '@/lib/store/notificationStore';

const POLL_MS = 30_000;

/**
 * Polls backend endpoints every 30s and feeds results into the notification store.
 * Must be mounted inside QueryClientProvider + AuthProvider context.
 */
export function useNotifications() {
  const user = useAuthStore((s) => s.user);
  const addNotifications = useNotificationStore((s) => s.addNotifications);

  const isModerator =
    user?.role === 'delegue' ||
    user?.role === 'chef_scolarite' ||
    user?.role === 'president_club';

  // ── Pending document reviews (moderators only) ──────────────────────────────
  const { data: reviewsData } = useQuery({
    queryKey: ['notif-pending-reviews'],
    queryFn: getPendingReviews,
    enabled: isModerator,
    refetchInterval: POLL_MS,
    staleTime: POLL_MS,
  });

  useEffect(() => {
    const items = reviewsData?.data?.data ?? [];
    if (items.length === 0) return;
    const notifs: AppNotification[] = items.map((doc) => ({
      id:         `review-${doc.id}`,
      title:      'Document à valider',
      message:    `"${doc.title ?? 'Document'}" attend votre validation.`,
      href:       '/drive',
      read:       false,
      created_at: doc.created_at ?? new Date().toISOString(),
    }));
    addNotifications(notifs);
  }, [reviewsData, addNotifications]);

  // ── Pending group requests (delegue / president_club) ───────────────────────
  // We don't know the group id here without extra fetch, so we use a generic notif
  // when the adhesions endpoint returns pending items.
  const { data: adhesionsData } = useQuery({
    queryKey: ['notif-pending-adhesions'],
    queryFn: () =>
      import('@/lib/api/client').then(({ default: api }) =>
        api.get<{ data: { id: string; created_at: string }[] }>('/adhesions', {
          params: { status: 'pending' },
        })
      ),
    enabled: isModerator,
    refetchInterval: POLL_MS,
    staleTime: POLL_MS,
  });

  useEffect(() => {
    const items = adhesionsData?.data?.data ?? [];
    if (items.length === 0) return;
    const notifs: AppNotification[] = items.map((a) => ({
      id:         `adhesion-${a.id}`,
      title:      'Demande d\'adhésion',
      message:    'Un étudiant demande à rejoindre votre groupe.',
      href:       '/groups',
      read:       false,
      created_at: a.created_at ?? new Date().toISOString(),
    }));
    addNotifications(notifs);
  }, [adhesionsData, addNotifications]);
}
