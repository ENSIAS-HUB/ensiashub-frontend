import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UploadFormData {
  filieres: { id: string; nom: string; slug: string; badge: string | null; is_tronc_commun: boolean }[];
  annees: { id: string; label: string; niveau: number }[];
  types: string[];
}

export interface UploadModulesParams {
  filiere_id?: string;
  annee_id?: string;
  semestre?: string;
}

export interface UploadModuleItem {
  id: string;
  nom: string;
  semestre: string;
  documents_count: number;
  elementModules?: { id: string; nom: string }[];
}

export interface UploadPayload {
  file: File;
  titre: string;
  element_module_id: string;
  type: string;
  description?: string;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useDriveFormData() {
  return useQuery<UploadFormData>({
    queryKey: ["drive-upload-form-data"],
    queryFn: () => apiClient.get("/drive/upload/form-data").then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });
}

export function useDriveModulesForUpload(params: UploadModulesParams) {
  return useQuery<{ modules: UploadModuleItem[] }>({
    queryKey: ["drive-upload-modules", params],
    queryFn: () =>
      apiClient
        .get("/drive/upload/modules", { params })
        .then((r) => r.data),
    enabled: !!(params.filiere_id && params.annee_id),
  });
}

export function useDriveUpload(onSuccess?: () => void) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadPayload) => {
      const form = new FormData();
      form.append("file", payload.file);
      form.append("titre", payload.titre);
      form.append("element_module_id", payload.element_module_id);
      form.append("type", payload.type);
      if (payload.description) form.append("description", payload.description);

      return apiClient.post("/drive/documents", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Document uploadé avec succès !");
      qc.invalidateQueries({ queryKey: ["drive"] });
      qc.invalidateQueries({ queryKey: ["drive-arborescence"] });
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erreur lors de l'upload du document.");
    },
  });
}
