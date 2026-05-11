import apiClient from './client';
import type { Filiere, Module, Document, ApiResponse, PaginatedResponse } from '@/lib/types';

export const getFilieres = () =>
  apiClient.get<ApiResponse<Filiere[]>>('/filieres');

export const createFiliere = (data: Partial<Filiere>) =>
  apiClient.post<ApiResponse<Filiere>>('/filieres', data);

export const getModules = (filiereId?: string) =>
  apiClient.get<ApiResponse<Module[]>>('/modules', { params: { filiere_id: filiereId } });

export const createModule = (data: Partial<Module>) =>
  apiClient.post<ApiResponse<Module>>('/modules', data);

export const deleteFiliere = (id: string) =>
  apiClient.delete(`/filieres/${id}`);

export const deleteModule = (id: string) =>
  apiClient.delete(`/modules/${id}`);

export const getDocuments = (moduleId?: string, filiereId?: string) =>
  apiClient.get<PaginatedResponse<Document>>('/documents', {
    params: { module_id: moduleId, filiere_id: filiereId },
  });

export const uploadDocument = (formData: FormData, onUploadProgress?: (pct: number) => void) =>
  apiClient.post<ApiResponse<Document>>('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onUploadProgress && e.total) {
        onUploadProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });

export const reviewDocument = (id: string, decision: 'approved' | 'rejected') =>
  apiClient.post<ApiResponse<Document>>('/document-reviews', { document_id: id, decision });

export const getPendingReviews = () =>
  apiClient.get<PaginatedResponse<Document>>('/document-reviews', { params: { status: 'pending' } });
