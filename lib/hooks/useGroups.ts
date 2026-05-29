"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  joinGroup,
  leaveGroup as apiLeaveGroup,
  approveMember as apiApproveMember,
  rejectMember as apiRejectMember,
  getPendingMembers,
  getAllPendingReviews,
} from "@/lib/api/groups";
import { toast } from "sonner";

// ── Join a club ───────────────────────────────────────────────────────────────
export function useJoinGroup(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => joinGroup(groupId),
    onSuccess: () => {
      toast.success("Demande envoyée !");
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erreur lors de la demande.";
      toast.error(msg);
    },
  });
}

// ── Leave a club ──────────────────────────────────────────────────────────────
export function useLeaveGroup(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiLeaveGroup(groupId),
    onSuccess: () => {
      toast.success("Vous avez quitté le groupe.");
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: () => toast.error("Impossible de quitter ce groupe."),
  });
}

// ── Pending membership requests for a specific club ───────────────────────────
export function usePendingMembers(groupId: string, enabled = true) {
  return useQuery({
    queryKey: ["group-requests", groupId],
    queryFn: () => getPendingMembers(groupId),
    enabled: !!groupId && enabled,
    select: (res) => res.data?.data ?? [],
  });
}

// ── Approve a membership request ──────────────────────────────────────────────
export function useApproveMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => apiApproveMember(groupId, userId),
    onSuccess: () => {
      toast.success("Membre accepté !");
      queryClient.invalidateQueries({ queryKey: ["group-requests", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["clubs-pending-reviews"] });
    },
    onError: () => toast.error("Erreur lors de l'approbation."),
  });
}

// ── Reject a membership request ───────────────────────────────────────────────
export function useRejectMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      apiRejectMember(groupId, userId, reason),
    onSuccess: () => {
      toast.success("Demande refusée.");
      queryClient.invalidateQueries({ queryKey: ["group-requests", groupId] });
      queryClient.invalidateQueries({ queryKey: ["clubs-pending-reviews"] });
    },
    onError: () => toast.error("Erreur lors du refus."),
  });
}

// ── All pending reviews for the current president (dashboard) ─────────────────
export function useAllPendingReviews() {
  return useQuery({
    queryKey: ["clubs-pending-reviews"],
    queryFn: () => getAllPendingReviews(),
    select: (res) => res.data?.data ?? [],
  });
}
