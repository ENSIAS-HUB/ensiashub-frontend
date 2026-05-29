/**
 * Backend-connected notification hooks.
 * Uses the POST /api/notifications/* endpoints.
 * Keep alongside the existing useNotifications.ts (which handles UI-only notifications).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import apiClient from "@/lib/api/client";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ServerNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  action_url?: string | null;
  read_at: string | null;
  created_at: string;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useUnreadCount() {
  return useQuery<{ count: number }>({
    queryKey: ["server-notifications-count"],
    queryFn: () =>
      apiClient.get("/notifications/unread-count").then((r) => r.data),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useServerNotifications(page = 1) {
  return useQuery<{ data: ServerNotification[]; last_page: number }>({
    queryKey: ["server-notifications", page],
    queryFn: () =>
      apiClient.get("/notifications", { params: { page } }).then((r) => r.data),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/notifications/${id}/read`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["server-notifications"] });
      qc.invalidateQueries({ queryKey: ["server-notifications-count"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.post("/notifications/read-all").then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["server-notifications"] });
      qc.invalidateQueries({ queryKey: ["server-notifications-count"] });
    },
  });
}

/**
 * Opens an SSE connection to /api/notifications/stream and keeps the
 * unread-count query fresh without polling.
 * Mount this once in a layout component.
 */
export function useNotificationStream() {
  const qc = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("auth_token") ?? ""
        : "";

    if (!token || !baseUrl) return;

    const url = `${baseUrl}/api/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener("unread", (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data) as { count: number };
        qc.setQueryData(["server-notifications-count"], { count: payload.count });
      } catch {
        // ignore parse errors
      }
    });

    es.addEventListener("close", () => es.close());
    es.onerror = () => es.close();

    return () => {
      es.close();
    };
  }, [qc]);
}
