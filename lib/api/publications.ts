import apiClient from "./client";
import type {
  Publication,
  Comment,
  ApiResponse,
  PaginatedResponse,
} from "@/lib/types";

export const getPublications = (page = 1, groupId?: string) =>
  apiClient.get<PaginatedResponse<Publication>>("/publications", {
    params: { page, ...(groupId ? { group_id: groupId } : {}) },
  });

export const createPublication = (data: {
  content: string;
  group_id: string;
  media_url?: string;
}) => apiClient.post<ApiResponse<Publication>>("/publications", data);

export const updatePublication = (id: string, data: Partial<Publication>) =>
  apiClient.put<ApiResponse<Publication>>(`/publications/${id}`, data);

export const publishPublication = (id: string) =>
  apiClient.post<ApiResponse<Publication>>(`/publications/${id}/publier`);

export const reactToPublication = (publicationId: string) =>
  apiClient.post<ApiResponse<void>>("/reactions", {
    publication_id: publicationId,
  });

export const getComments = (type: string, id: string) =>
  apiClient.get<ApiResponse<Comment[]>>(`/${type}/${id}/comments`);

export const createComment = (publicationId: string, content: string) =>
  apiClient.post<ApiResponse<Comment>>("/commentaires", {
    publication_id: publicationId,
    content,
  });
