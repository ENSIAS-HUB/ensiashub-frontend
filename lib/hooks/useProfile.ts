"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/authStore";
import type {
  UserProfile,
  Project,
  ProfileActivity,
  FollowUser,
  UpdateProfilePayload,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "@/lib/types/profile";

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

// ── PROFILE ──────────────────────────────────────────────────────────────

export const useUserProfile = (username: string) =>
  useQuery<UserProfile>({
    queryKey: ["profile", username],
    queryFn: () =>
      apiClient.get(`/users/${username}/profile`).then((r) => r.data.user),
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });

export const useMyProfile = () =>
  useQuery<UserProfile>({
    queryKey: ["profile", "me"],
    queryFn: () => apiClient.get("/profile").then((r) => r.data.user),
  });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) =>
      apiClient.put("/profile", data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profil mis à jour ✓");
    },
    onError: () => {
      toast.error("Impossible de mettre à jour le profil");
    },
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  const patchUser = useAuthStore((s) => s.patchUser);
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      return apiClient
        .post("/profile/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data as { avatar_url: string });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      patchUser({ avatar: data.avatar_url, avatar_url: data.avatar_url });
      toast.success("Avatar mis à jour ✓");
    },
    onError: () => {
      toast.error("Impossible de mettre à jour l'avatar");
    },
  });
};

export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();
  const patchUser = useAuthStore((s) => s.patchUser);
  return useMutation({
    mutationFn: () =>
      apiClient
        .delete("/profile/avatar")
        .then((r) => r.data as { avatar_url: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      patchUser({ avatar: undefined, avatar_url: null });
      toast.success("Photo de profil supprimée");
    },
    onError: () => {
      toast.error("Impossible de supprimer la photo");
    },
  });
};

export const useUpdateCover = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("cover", file);
      return apiClient
        .post("/profile/cover", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data as { cover_url: string });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Bannière mise à jour ✓");
    },
    onError: () => {
      toast.error("Impossible de mettre à jour la bannière");
    },
  });
};

export const useDeleteCover = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient
        .delete("/profile/cover")
        .then((r) => r.data as { cover_url: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Bannière supprimée");
    },
    onError: () => {
      toast.error("Impossible de supprimer la bannière");
    },
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (data: {
      current_password: string;
      new_password: string;
      new_password_confirmation: string;
    }) => apiClient.put("/profile/password", data).then((r) => r.data),
    onSuccess: () => {
      toast.success("Mot de passe mis à jour ✓");
    },
    onError: (err: {
      response?: {
        data?: { errors?: Record<string, string[]>; message?: string };
      };
    }) => {
      const msg =
        err.response?.data?.errors?.current_password?.[0] ??
        err.response?.data?.message ??
        "Impossible de mettre à jour le mot de passe";
      toast.error(msg);
    },
  });

// ── PROJECTS ─────────────────────────────────────────────────────────────

export const useUserProjects = (username: string) =>
  useQuery<Project[]>({
    queryKey: ["projects", username],
    queryFn: () =>
      apiClient.get(`/users/${username}/projects`).then((r) => r.data),
    enabled: !!username,
  });

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectPayload) =>
      apiClient.post("/projects", data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projet ajouté ✓");
    },
    onError: () => {
      toast.error("Impossible d'ajouter le projet");
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateProjectPayload) =>
      apiClient.put(`/projects/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projet mis à jour ✓");
    },
    onError: () => {
      toast.error("Impossible de mettre à jour le projet");
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`/projects/${id}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projet supprimé");
    },
    onError: () => {
      toast.error("Impossible de supprimer le projet");
    },
  });
};

export const useToggleFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.patch(`/projects/${id}/feature`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

// ── FOLLOW ───────────────────────────────────────────────────────────────

export const useFollow = (username: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.post(`/users/${username}/follow`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.invalidateQueries({ queryKey: ["followers", username] });
    },
    onError: () => {
      toast.error("Impossible de suivre cet utilisateur");
    },
  });
};

export const useUnfollow = (username: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.delete(`/users/${username}/follow`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.invalidateQueries({ queryKey: ["followers", username] });
    },
    onError: () => {
      toast.error("Impossible de ne plus suivre cet utilisateur");
    },
  });
};

// ── ACTIVITY ─────────────────────────────────────────────────────────────

export const useUserActivity = (username: string) =>
  useQuery<PaginatedResponse<ProfileActivity>>({
    queryKey: ["activity", username],
    queryFn: () =>
      apiClient.get(`/users/${username}/activity`).then((r) => r.data),
    enabled: !!username,
  });

// ── FOLLOWERS / FOLLOWING ────────────────────────────────────────────────

export const useUserFollowers = (username: string) =>
  useQuery<PaginatedResponse<FollowUser>>({
    queryKey: ["followers", username],
    queryFn: () =>
      apiClient.get(`/users/${username}/followers`).then((r) => r.data),
    enabled: !!username,
  });

export const useUserFollowing = (username: string) =>
  useQuery<PaginatedResponse<FollowUser>>({
    queryKey: ["following", username],
    queryFn: () =>
      apiClient.get(`/users/${username}/following`).then((r) => r.data),
    enabled: !!username,
  });

// ── SUGGESTIONS ──────────────────────────────────────────────────────────

export const useFollowSuggestions = () =>
  useQuery<FollowUser[]>({
    queryKey: ["suggestions"],
    queryFn: () =>
      apiClient.get("/suggestions").then((r) => r.data.suggestions),
    staleTime: 1000 * 60 * 10,
  });
