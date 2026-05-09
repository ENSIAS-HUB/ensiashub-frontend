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

export const getDocuments = (moduleId?: string, filiereId?: string) =>
  apiClient.get<PaginatedResponse<Document>>('/documents', {
    params: { module_id: moduleId, filiere_id: filiereId },
  });

export const uploadDocument = (formData: FormData) =>
  apiClient.post<ApiResponse<Document>>('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
