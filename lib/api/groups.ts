import apiClient from './client';
import type { Group, ApiResponse, PaginatedResponse, User } from '@/lib/types';

export const getGroups = () =>
  apiClient.get<PaginatedResponse<Group>>('/groups');

export const getGroup = (id: string) =>
  apiClient.get<ApiResponse<Group>>(`/groups/${id}`);

export const createGroup = (data: Partial<Group>) =>
  apiClient.post<ApiResponse<Group>>('/groups', data);

export const getGroupMembers = (id: string) =>
  apiClient.get<ApiResponse<User[]>>(`/groups/${id}/membres`);

export const getGroupRequests = (id: string) =>
  apiClient.get<ApiResponse<User[]>>(`/groups/${id}/demandes`);

export const joinGroup = (id: string) =>
  apiClient.post<ApiResponse<void>>(`/groups/${id}/ajouter-membre`);

export const validateMember = (id: string, userId: string) =>
  apiClient.post<ApiResponse<void>>(`/groups/${id}/valider-membre`, { user_id: userId });
