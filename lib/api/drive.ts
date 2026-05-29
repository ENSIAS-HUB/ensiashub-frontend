import apiClient from "./client";
import type {
  Filiere,
  Module,
  Document,
  ApiResponse,
  PaginatedResponse,
} from "@/lib/types";
import type {
  DriveFiliere,
  DriveDocument,
  DriveFilters,
  UploadDrivePayload,
} from "@/lib/types/drive";

// ── Legacy endpoints (keep for existing review flow) ─────────────────────────

export const getFilieres = () =>
  apiClient.get<ApiResponse<Filiere[]>>("/filieres");

export const createFiliere = (data: Partial<Filiere>) =>
  apiClient.post<ApiResponse<Filiere>>("/filieres", data);

export const getModules = (filiereId?: string) =>
  apiClient.get<ApiResponse<Module[]>>("/modules", {
    params: { filiere_id: filiereId },
  });

export const createModule = (data: Partial<Module>) =>
  apiClient.post<ApiResponse<Module>>("/modules", data);

export const deleteFiliere = (id: string) =>
  apiClient.delete(`/filieres/${id}`);

export const deleteModule = (id: string) => apiClient.delete(`/modules/${id}`);

export const getDocuments = (moduleId?: string, filiereId?: string) =>
  apiClient.get<PaginatedResponse<Document>>("/documents", {
    params: { module_pedagogique_id: moduleId, filiere_id: filiereId },
  });

export const uploadDocument = (
  formData: FormData,
  onUploadProgress?: (pct: number) => void,
) =>
  apiClient.post<ApiResponse<Document>>("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onUploadProgress && e.total) {
        onUploadProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });

export const reviewDocument = (id: string, decision: "approved" | "rejected") =>
  apiClient.post<ApiResponse<Document>>("/document-reviews", {
    document_id: id,
    decision,
  });

export const getPendingReviews = () =>
  apiClient.get<PaginatedResponse<Document>>("/document-reviews", {
    params: { status: "pending" },
  });

// ── Azure Drive endpoints ─────────────────────────────────────────────────────

export const getDriveFilieres = () =>
  apiClient
    .get<{ filieres: DriveFiliere[] }>("/drive/filieres")
    .then((r) => r.data.filieres);

export const getDriveModules = (filiereId: string) =>
  apiClient
    .get<{
      modules: import("@/lib/types/drive").DriveModule[];
    }>(`/drive/filieres/${filiereId}/modules`)
    .then((r) => r.data.modules);

export const getDriveDocuments = (filters: DriveFilters = {}) =>
  apiClient.get("/drive/documents", { params: filters }).then((r) => r.data);

export const getDriveDocument = (id: string) =>
  apiClient
    .get<{ document: DriveDocument }>(`/drive/documents/${id}`)
    .then((r) => r.data.document);

export const uploadDriveDocument = (
  payload: UploadDrivePayload,
  onUploadProgress?: (pct: number) => void,
) => {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("title", payload.title);
  if (payload.description) formData.append("description", payload.description);
  if (payload.filiere_id) formData.append("filiere_id", payload.filiere_id);
  if (payload.module_id) formData.append("module_id", payload.module_id);
  if (payload.filiere_slug)
    formData.append("filiere_slug", payload.filiere_slug);
  if (payload.module_slug) formData.append("module_slug", payload.module_slug);
  formData.append("type", payload.type);
  if (payload.semester) formData.append("semester", payload.semester);
  if (payload.year) formData.append("year", String(payload.year));

  return apiClient
    .post<{ document: DriveDocument }>("/drive/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total) {
          onUploadProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    })
    .then((r) => r.data.document);
};

export const downloadDriveDocument = (id: string) =>
  apiClient
    .get<{ url: string }>(`/drive/documents/${id}/download`)
    .then((r) => r.data.url);

export const deleteDriveDocument = (id: string) =>
  apiClient.delete(`/drive/documents/${id}`).then((r) => r.data);

// ── Drive v2 endpoints ────────────────────────────────────────────────────────

import type {
  MesModulesResponse,
  ElementModuleItem,
  DriveFiliere2,
  UploadDrivePayload2,
  DriveDocument2,
} from "@/lib/types/drive";

export const getMesModules = (): Promise<MesModulesResponse> =>
  apiClient.get<MesModulesResponse>("/drive/mes-modules").then((r) => r.data);

export const getMesArborescence = (): Promise<
  import("@/lib/types/drive").ArborescenceResponse
> =>
  apiClient
    .get<
      import("@/lib/types/drive").ArborescenceResponse
    >("/drive/mes-arborescence")
    .then((r) => r.data);

export const getArborescence = (
  filiereId: string,
  annee: string,
): Promise<import("@/lib/types/drive").ArborescenceResponse> =>
  apiClient
    .get<
      import("@/lib/types/drive").ArborescenceResponse
    >(`/drive/filieres/${filiereId}/arborescence`, { params: { annee } })
    .then((r) => r.data);

export const getDriveFilieres2 = (): Promise<DriveFiliere2[]> =>
  apiClient
    .get<{ filieres: DriveFiliere2[] }>("/drive/filieres")
    .then((r) => r.data.filieres);

export const getDriveModules2 = (filiereId: string, annee?: string) =>
  apiClient
    .get<{
      modules: import("@/lib/types/drive").ModuleDrive[];
    }>(`/drive/filieres/${filiereId}/modules`, { params: annee ? { annee } : {} })
    .then((r) => r.data.modules);

export const getDriveElements = (
  moduleId: string,
): Promise<ElementModuleItem[]> =>
  apiClient
    .get<{
      elements: ElementModuleItem[];
    }>(`/drive/modules/${moduleId}/elements`)
    .then((r) => r.data.elements);

export const searchDriveDocuments = (filters: {
  filiere_id?: string;
  annee?: string;
  type?: string;
  search?: string;
}) =>
  apiClient.get("/drive/documents", { params: filters }).then((r) => r.data);

export const uploadDriveDocument2 = (
  payload: UploadDrivePayload2,
  onUploadProgress?: (pct: number) => void,
): Promise<DriveDocument2> => {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("titre", payload.titre);
  formData.append("element_module_id", payload.element_module_id);
  formData.append("type", payload.type);
  if (payload.description) formData.append("description", payload.description);
  return apiClient
    .post<{ document: DriveDocument2 }>("/drive/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total)
          onUploadProgress(Math.round((e.loaded * 100) / e.total));
      },
    })
    .then((r) => r.data.document);
};
