import apiClient from "./client";
import type {
  Group,
  ApiResponse,
  PaginatedResponse,
  MyGroups,
  User,
  MembershipRequest,
  ClubPendingReview,
} from "@/lib/types";

export const getGroups = () =>
  apiClient.get<PaginatedResponse<Group>>("/groups");

export const getGroup = (id: string) =>
  apiClient.get<ApiResponse<Group>>(`/groups/${id}`);

export const createGroup = (data: Partial<Group>) =>
  apiClient.post<ApiResponse<Group>>("/groups", data);

export const getGroupMembers = (id: string) =>
  apiClient.get<ApiResponse<User[]>>(`/groups/${id}/membres`);

export const getGroupRequests = (id: string) =>
  apiClient.get<ApiResponse<User[]>>(`/groups/${id}/demandes`);

export const joinGroup = (id: string) =>
  apiClient.post<ApiResponse<void>>(`/groups/${id}/ajouter-membre`);

export const validateMember = (id: string, userId: string) =>
  apiClient.post<ApiResponse<void>>(`/groups/${id}/valider-membre`, {
    user_id: userId,
  });

export const approveMember = (groupId: string, userId: string) =>
  apiClient.post<ApiResponse<void>>(
    `/groups/${groupId}/members/${userId}/approve`,
  );

export const rejectMember = (
  groupId: string,
  userId: string,
  reason?: string,
) =>
  apiClient.post<ApiResponse<void>>(
    `/groups/${groupId}/members/${userId}/reject`,
    { reason },
  );

export const leaveGroup = (groupId: string) =>
  apiClient.delete<ApiResponse<void>>(`/groups/${groupId}/leave`);

export const getPendingMembers = (groupId: string) =>
  apiClient.get<ApiResponse<MembershipRequest[]>>(
    `/groups/${groupId}/demandes`,
  );

export const getAllPendingReviews = () =>
  apiClient.get<ApiResponse<ClubPendingReview[]>>("/clubs/pending-reviews");

export const getMyGroups = () =>
  apiClient.get<ApiResponse<MyGroups>>("/groups/mine");
