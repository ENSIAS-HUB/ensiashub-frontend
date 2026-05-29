import apiClient from "./client";
import type { Publication, PaginatedResponse } from "@/lib/types";

export const getGlobalFeed = (page = 1) =>
  apiClient.get<PaginatedResponse<Publication>>("/feed", { params: { page } });

export const getGroupFeed = (groupId: string, page = 1) =>
  apiClient.get<PaginatedResponse<Publication>>(`/groups/${groupId}/feed`, {
    params: { page },
  });

export const createPost = (formData: FormData) =>
  apiClient.post<{ success: boolean; data: Publication }>(
    "/publications",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
