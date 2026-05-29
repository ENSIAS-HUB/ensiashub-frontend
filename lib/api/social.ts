import apiClient from "@/lib/api/client";
import type {
  SocialableType,
  SocialComment,
  CommentsPaginated,
  SavedItem,
  Share,
  Report,
  ShareChannel,
  ReportReason,
} from "@/lib/types/social";

// ── Réactions ─────────────────────────────────────────────────────────────

export const toggleReaction = (
  type: SocialableType,
  id: string | number,
  reaction = "like",
) =>
  apiClient.post<{
    success: boolean;
    reacted: boolean;
    reactions_count: number;
    user_emoji: string | null;
  }>(`/${type}/${id}/react`, { reaction });

// ── Commentaires ───────────────────────────────────────────────────────────

export const fetchComments = (
  type: SocialableType,
  id: string | number,
  page = 1,
) =>
  apiClient.get<{ success: boolean; data: CommentsPaginated }>(
    `/${type}/${id}/comments`,
    { params: { page } },
  );

export const postComment = (
  type: SocialableType,
  id: string | number,
  content: string,
) =>
  apiClient.post<{ success: boolean; data: SocialComment }>(
    `/${type}/${id}/comments`,
    { content },
  );

export const replyToComment = (commentId: number, content: string) =>
  apiClient.post<{ success: boolean; data: SocialComment }>(
    `/comments/${commentId}/reply`,
    { content },
  );

export const editComment = (commentId: number, content: string) =>
  apiClient.put<{ success: boolean; data: SocialComment }>(
    `/comments/${commentId}`,
    { content },
  );

export const deleteComment = (commentId: number) =>
  apiClient.delete<{ success: boolean }>(`/comments/${commentId}`);

// ── Sauvegardes ────────────────────────────────────────────────────────────

export const fetchSavedItems = (type?: SocialableType) =>
  apiClient.get<{ success: boolean; data: { data: SavedItem[] } }>("/saved", {
    params: type ? { type } : {},
  });

export const saveItem = (type: SocialableType, id: string | number) =>
  apiClient.post<{ success: boolean; saved: boolean; data: SavedItem }>(
    `/${type}/${id}/save`,
  );

export const unsaveItem = (type: SocialableType, id: string | number) =>
  apiClient.delete<{ success: boolean; saved: boolean }>(`/${type}/${id}/save`);

// ── Partages ───────────────────────────────────────────────────────────────

export const shareItem = (
  type: SocialableType,
  id: string | number,
  channel: ShareChannel,
  target_group_id?: number,
) =>
  apiClient.post<{ success: boolean; data: Share }>(`/${type}/${id}/share`, {
    channel,
    target_group_id,
  });

// ── Signalements ───────────────────────────────────────────────────────────

export const reportItem = (
  type: SocialableType,
  id: string | number,
  reason: ReportReason,
  details?: string,
) =>
  apiClient.post<{ success: boolean; data: Report }>(`/${type}/${id}/report`, {
    reason,
    details,
  });
