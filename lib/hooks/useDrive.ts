"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getFilieres,
  getModules,
  getDocuments,
  uploadDocument,
  reviewDocument,
  getDriveFilieres,
  getDriveDocuments,
  getDriveDocument,
  uploadDriveDocument,
  downloadDriveDocument,
  deleteDriveDocument,
} from "@/lib/api/drive";
import { useState } from "react";
import type {
  Filiere,
  Module,
  Document,
  ValidationStatus,
  DocumentType,
} from "@/lib/types";
import type {
  DriveFiliere,
  DriveDocument,
  DriveFilters,
  UploadDrivePayload,
} from "@/lib/types/drive";

// ── Backend → Frontend field normalizers ─────────────────────────────────────

function normalizeFiliere(f: any): Filiere {
  return {
    ...f,
    name: f.nom ?? "",
    code: f.code ?? (f.nom ? (f.nom as string).slice(0, 2).toUpperCase() : ""),
  };
}

function isValidFiliere(f: any): boolean {
  return !!(f.nom && String(f.nom).trim() !== "");
}

function normalizeModule(m: any): Module {
  const raw = String(m.semestre ?? "");
  const semNum = raw ? parseInt(raw.replace("S", "")) : 0;
  return {
    ...m,
    name: m.nom ?? "",
    semester: isNaN(semNum) ? 0 : semNum,
  };
}

const docTypeMap: Record<string, DocumentType> = {
  cours: "cours",
  td: "td",
  examen: "examen",
  resume: "resume",
  autre: "cours",
};

const statusMap: Record<string, ValidationStatus> = {
  Valide: "approved",
  valide: "approved",
  EnAttente: "pending",
  enattente: "pending",
  Rejete: "rejected",
  rejete: "rejected",
};

function normalizeDocument(d: any): Document {
  const type: DocumentType =
    docTypeMap[(d.typeDocument ?? "").toLowerCase()] ?? "cours";
  const user = d.user ?? {};
  const mod = d.module ?? {};
  return {
    ...d,
    title: d.titre ?? d.nom ?? "",
    type,
    file_url: d.urlStockage ?? d.preview_url ?? d.download_url ?? "",
    preview_url: d.preview_url ?? d.urlStockage ?? "",
    download_url: d.download_url ?? d.urlStockage ?? "",
    file_size: d.taille ?? 0,
    status: statusMap[d.statutValidation] ?? "pending",
    uploader: {
      id: user.id ?? "",
      name:
        `${user.prenom ?? ""} ${user.nom ?? ""}`.trim() ||
        (user.name ?? "Inconnu"),
      email: user.emailInstitutionnel ?? user.email ?? "",
      avatar: user.photoProfil ?? undefined,
      role:
        (Array.isArray(user.roles) ? user.roles[0] : user.roles) ?? "etudiant",
      created_at: user.created_at ?? "",
    },
    module: mod.id
      ? {
          ...mod,
          name: mod.nom ?? "",
          semester: mod.semestre
            ? parseInt(String(mod.semestre).replace("S", ""))
            : 0,
          filiere_id: mod.filiere_id ?? "",
        }
      : { id: "", nom: "", name: "", filiere_id: "", semester: 0 },
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useDrive() {
  const queryClient = useQueryClient();
  const [selectedFiliereId, setSelectedFiliereId] = useState<string | null>(
    null,
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const filieresQuery = useQuery({
    queryKey: ["filieres"],
    queryFn: () => getFilieres(),
  });

  const modulesQuery = useQuery({
    queryKey: ["modules", selectedFiliereId],
    queryFn: () => getModules(selectedFiliereId ?? undefined),
    enabled: !!selectedFiliereId,
  });

  const documentsQuery = useQuery({
    queryKey: ["documents", selectedModuleId, selectedFiliereId],
    queryFn: () =>
      getDocuments(
        selectedModuleId ?? undefined,
        selectedFiliereId ?? undefined,
      ),
    enabled: !!(selectedModuleId || selectedFiliereId),
  });

  const upload = useMutation({
    mutationFn: (formData: FormData) =>
      uploadDocument(formData, setUploadProgress),
    onSuccess: () => {
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: () => setUploadProgress(0),
  });

  const review = useMutation({
    mutationFn: ({
      id,
      decision,
    }: {
      id: string;
      decision: "approved" | "rejected";
    }) => reviewDocument(id, decision),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  // Backend returns: {success, data: paginator{current_page, data:[], ...}}
  // So: response.data = {success, data: paginator}
  //     response.data.data = paginator
  //     response.data.data.data = the actual array
  const rawFilieres: any[] = (
    (filieresQuery.data as any)?.data?.data?.data ?? []
  ).filter(isValidFiliere);
  const rawModules: any[] = (modulesQuery.data as any)?.data?.data?.data ?? [];
  const rawDocuments: any[] =
    (documentsQuery.data as any)?.data?.data?.data ?? [];

  return {
    filieres: rawFilieres.map(normalizeFiliere) as Filiere[],
    modules: rawModules.map(normalizeModule) as Module[],
    documents: rawDocuments.map(normalizeDocument) as Document[],
    isLoadingFilieres: filieresQuery.isLoading,
    isLoadingDocuments: documentsQuery.isLoading,
    isErrorDocuments: documentsQuery.isError,
    refetchDocuments: documentsQuery.refetch,
    selectedFiliereId,
    selectedModuleId,
    setSelectedFiliereId,
    setSelectedModuleId,
    uploadDoc: upload.mutate,
    isUploading: upload.isPending,
    uploadProgress,
    reviewDoc: review.mutate,
    isReviewing: review.isPending,
  };
}

// ── Azure Drive hooks ─────────────────────────────────────────────────────────

/** Filieres avec modules et compteur de documents (endpoint Azure Drive) */
export const useDriveFilieres = () =>
  useQuery<DriveFiliere[]>({
    queryKey: ["drive-filieres"],
    queryFn: getDriveFilieres,
    staleTime: 5 * 60 * 1000,
  });

/** Liste paginée de documents Azure Drive */
export const useDriveDocuments = (filters: DriveFilters = {}) =>
  useQuery({
    queryKey: ["drive-documents", filters],
    queryFn: () => getDriveDocuments(filters),
  });

/** Détail d'un document Azure Drive */
export const useDriveDocument = (id: string) =>
  useQuery<DriveDocument>({
    queryKey: ["drive-document", id],
    queryFn: () => getDriveDocument(id),
    enabled: !!id,
  });

/** Upload vers Azure Blob Storage */
export const useUploadDriveDocument = () => {
  const qc = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (payload: UploadDrivePayload) =>
      uploadDriveDocument(payload, setProgress),
    onSuccess: () => {
      setProgress(0);
      qc.invalidateQueries({ queryKey: ["drive-documents"] });
      toast.success("Document uploadé avec succès ✓");
    },
    onError: (error: unknown) => {
      setProgress(0);
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Erreur lors de l'upload";
      toast.error(msg);
    },
  });

  return { ...mutation, progress };
};

/** Téléchargement — ouvre l'URL Azure dans un nouvel onglet */
export const useDownloadDriveDocument = () =>
  useMutation({
    mutationFn: async (doc: DriveDocument) => {
      const url = await downloadDriveDocument(doc.id);
      window.open(url, "_blank");
      return url;
    },
    onError: () => toast.error("Impossible de télécharger le fichier."),
  });

/** Suppression d'un document Azure */
export const useDeleteDriveDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDriveDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drive-documents"] });
      toast.success("Document supprimé");
    },
    onError: () => toast.error("Impossible de supprimer le document."),
  });
};

// ── Drive v2 hooks ────────────────────────────────────────────────────────────

import {
  getMesModules,
  getMesArborescence,
  getArborescence,
  getDriveFilieres2,
  getDriveModules2,
  getDriveElements,
  uploadDriveDocument2,
} from "@/lib/api/drive";
import type {
  MesModulesResponse,
  DriveFiliere2,
  ModuleDrive,
  ElementModuleItem,
  UploadDrivePayload2,
  ArborescenceResponse,
} from "@/lib/types/drive";

export const useMesModules = () =>
  useQuery<MesModulesResponse>({
    queryKey: ["drive-mes-modules"],
    queryFn: getMesModules,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useMesArborescence = () =>
  useQuery<ArborescenceResponse>({
    queryKey: ["drive-mes-arborescence"],
    queryFn: getMesArborescence,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useDriveArborescence = (filiereId: string | null, annee: string) =>
  useQuery<ArborescenceResponse>({
    queryKey: ["drive-arborescence", filiereId, annee],
    queryFn: () => getArborescence(filiereId!, annee),
    enabled: !!filiereId && !!annee,
    staleTime: 5 * 60 * 1000,
  });

export const useDriveFilieres2 = () =>
  useQuery<DriveFiliere2[]>({
    queryKey: ["drive-filieres2"],
    queryFn: getDriveFilieres2,
    staleTime: 5 * 60 * 1000,
  });

export const useDriveModules2 = (filiereId: string | null, annee?: string) =>
  useQuery<ModuleDrive[]>({
    queryKey: ["drive-modules2", filiereId, annee],
    queryFn: () => getDriveModules2(filiereId!, annee),
    enabled: !!filiereId,
    staleTime: 5 * 60 * 1000,
  });

export const useDriveElements = (moduleId: string | null) =>
  useQuery<ElementModuleItem[]>({
    queryKey: ["drive-elements", moduleId],
    queryFn: () => getDriveElements(moduleId!),
    enabled: !!moduleId,
  });

export const useUploadDriveDocument2 = () => {
  const qc = useQueryClient();
  const [progress, setProgress] = useState(0);
  const mutation = useMutation({
    mutationFn: (payload: UploadDrivePayload2) =>
      uploadDriveDocument2(payload, setProgress),
    onSuccess: () => {
      setProgress(0);
      qc.invalidateQueries({ queryKey: ["drive-mes-modules"] });
      qc.invalidateQueries({ queryKey: ["drive-elements"] });
      toast.success("Document uploadé avec succès ✓");
    },
    onError: (error: unknown) => {
      setProgress(0);
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Erreur lors de l'upload";
      toast.error(msg);
    },
  });
  return { ...mutation, progress };
};

// ── Sync status (polling pour les jobs Azure en attente) ─────────────────────

import apiClient from "@/lib/api/client";

export const useSyncStatus = (enabled = true) =>
  useQuery({
    queryKey: ["drive-sync-status"],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        pending_jobs: number;
        failed_jobs: number;
        is_syncing: boolean;
      }>("/admin/drive/sync-status");
      return data;
    },
    enabled,
    refetchInterval: (query) => (query.state.data?.is_syncing ? 2000 : false),
    staleTime: 1000,
  });
