import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchComments,
  postComment,
  replyToComment,
  editComment,
  deleteComment,
  fetchSavedItems,
  saveItem,
  unsaveItem,
  shareItem,
  reportItem,
  toggleReaction,
} from "@/lib/api/social";
import type {
  SocialableType,
  SocialComment,
  ShareChannel,
  ReportReason,
} from "@/lib/types/social";

// ─────────────────────────────────────────────────────────────────────────────
// Commentaires
// ─────────────────────────────────────────────────────────────────────────────

export function useComments(type: SocialableType, id: string | number) {
  return useQuery({
    queryKey: ["social-comments", type, id],
    queryFn: () => fetchComments(type, id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateComment(type: SocialableType, id: string | number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => postComment(type, id, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social-comments", type, id] });
    },
    onError: () => toast.error("Impossible d'envoyer le commentaire"),
  });
}

export function useReplyComment(type: SocialableType, id: string | number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
    }) => replyToComment(commentId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social-comments", type, id] });
    },
    onError: () => toast.error("Impossible d'envoyer la réponse"),
  });
}

export function useEditComment(type: SocialableType, id: string | number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
    }) => editComment(commentId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social-comments", type, id] });
    },
    onError: () => toast.error("Impossible de modifier le commentaire"),
  });
}

export function useDeleteComment(type: SocialableType, id: string | number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social-comments", type, id] });
    },
    onError: () => toast.error("Impossible de supprimer le commentaire"),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Sauvegardes
// ─────────────────────────────────────────────────────────────────────────────

export function useSavedItems(type?: SocialableType) {
  return useQuery({
    queryKey: ["saved-items", type ?? "all"],
    queryFn: () => fetchSavedItems(type).then((r) => r.data.data.data),
  });
}

export function useSaveToggle(type: SocialableType, id: string | number) {
  const qc = useQueryClient();

  const save = useMutation({
    mutationFn: () => saveItem(type, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-items"] });
      toast.success("Sauvegardé !");
    },
    onError: () => toast.error("Impossible de sauvegarder"),
  });

  const unsave = useMutation({
    mutationFn: () => unsaveItem(type, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-items"] });
      toast.success("Retiré des sauvegardes");
    },
    onError: () => toast.error("Impossible de retirer la sauvegarde"),
  });

  return { save, unsave };
}

// ─────────────────────────────────────────────────────────────────────────────
// Partages
// ─────────────────────────────────────────────────────────────────────────────

export function useShare(type: SocialableType, id: string | number) {
  return useMutation({
    mutationFn: ({
      channel,
      target_group_id,
    }: {
      channel: ShareChannel;
      target_group_id?: number;
    }) => shareItem(type, id, channel, target_group_id),
    onSuccess: () => toast.success("Partagé !"),
    onError: () => toast.error("Impossible de partager"),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Signalements
// ─────────────────────────────────────────────────────────────────────────────

export function useReport(type: SocialableType, id: string | number) {
  return useMutation({
    mutationFn: ({
      reason,
      details,
    }: {
      reason: ReportReason;
      details?: string;
    }) => reportItem(type, id, reason, details),
    onSuccess: () => toast.success("Signalement envoyé"),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? "Impossible d'envoyer le signalement");
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Réactions polymorphiques
// ─────────────────────────────────────────────────────────────────────────────

export function useToggleReaction(type: SocialableType, id: string | number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reaction: string) => toggleReaction(type, id, reaction),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: () => toast.error("Impossible d'envoyer la réaction"),
  });
}
