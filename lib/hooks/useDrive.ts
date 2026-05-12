'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFilieres, getModules, getDocuments, uploadDocument, reviewDocument } from '@/lib/api/drive';
import { useState } from 'react';
import type { Filiere, Module, Document, ValidationStatus, DocumentType } from '@/lib/types';

// ── Backend → Frontend field normalizers ─────────────────────────────────────

function normalizeFiliere(f: any): Filiere {
  return {
    ...f,
    name: f.nom ?? '',
    code: f.code ?? (f.nom ? (f.nom as string).slice(0, 2).toUpperCase() : ''),
  };
}

function isValidFiliere(f: any): boolean {
  return !!(f.nom && String(f.nom).trim() !== '');
}

function normalizeModule(m: any): Module {
  const raw = String(m.semestre ?? '');
  const semNum = raw ? parseInt(raw.replace('S', '')) : 0;
  return {
    ...m,
    name: m.nom ?? '',
    semester: isNaN(semNum) ? 0 : semNum,
  };
}

const docTypeMap: Record<string, DocumentType> = {
  cours: 'cours',
  td: 'td',
  examen: 'examen',
  resume: 'resume',
  autre: 'cours',
};

const statusMap: Record<string, ValidationStatus> = {
  Valide: 'approved', valide: 'approved',
  EnAttente: 'pending', enattente: 'pending',
  Rejete: 'rejected', rejete: 'rejected',
};

function normalizeDocument(d: any): Document {
  const type: DocumentType = docTypeMap[(d.typeDocument ?? '').toLowerCase()] ?? 'cours';
  const user = d.user ?? {};
  const mod  = d.module ?? {};
  return {
    ...d,
    title:   d.titre ?? d.nom ?? '',
    type,
    file_url:    d.urlStockage ?? d.preview_url ?? d.download_url ?? '',
    preview_url: d.preview_url ?? d.urlStockage ?? '',
    download_url: d.download_url ?? d.urlStockage ?? '',
    file_size: d.taille ?? 0,
    status: statusMap[d.statutValidation] ?? 'pending',
    uploader: {
      id:         user.id ?? '',
      name:       `${user.prenom ?? ''} ${user.nom ?? ''}`.trim() || (user.name ?? 'Inconnu'),
      email:      user.emailInstitutionnel ?? user.email ?? '',
      avatar:     user.photoProfil ?? undefined,
      role:       (Array.isArray(user.roles) ? user.roles[0] : user.roles) ?? 'etudiant',
      created_at: user.created_at ?? '',
    },
    module: mod.id ? {
      ...mod,
      name:       mod.nom ?? '',
      semester:   mod.semestre ? parseInt(String(mod.semestre).replace('S', '')) : 0,
      filiere_id: mod.filiere_id ?? '',
    } : { id: '', nom: '', name: '', filiere_id: '', semester: 0 },
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useDrive() {
  const queryClient = useQueryClient();
  const [selectedFiliereId, setSelectedFiliereId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId]   = useState<string | null>(null);
  const [uploadProgress, setUploadProgress]       = useState(0);

  const filieresQuery = useQuery({
    queryKey: ['filieres'],
    queryFn: () => getFilieres(),
  });

  const modulesQuery = useQuery({
    queryKey: ['modules', selectedFiliereId],
    queryFn: () => getModules(selectedFiliereId ?? undefined),
    enabled: !!selectedFiliereId,
  });

  const documentsQuery = useQuery({
    queryKey: ['documents', selectedModuleId, selectedFiliereId],
    queryFn: () => getDocuments(selectedModuleId ?? undefined, selectedFiliereId ?? undefined),
    enabled: !!(selectedModuleId || selectedFiliereId),
  });

  const upload = useMutation({
    mutationFn: (formData: FormData) => uploadDocument(formData, setUploadProgress),
    onSuccess: () => {
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: () => setUploadProgress(0),
  });

  const review = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'approved' | 'rejected' }) =>
      reviewDocument(id, decision),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  // Backend returns: {success, data: paginator{current_page, data:[], ...}}
  // So: response.data = {success, data: paginator}
  //     response.data.data = paginator
  //     response.data.data.data = the actual array
  const rawFilieres:  any[] = ((filieresQuery.data  as any)?.data?.data?.data ?? []).filter(isValidFiliere);
  const rawModules:   any[] = (modulesQuery.data   as any)?.data?.data?.data ?? [];
  const rawDocuments: any[] = (documentsQuery.data as any)?.data?.data?.data ?? [];

  return {
    filieres:  rawFilieres.map(normalizeFiliere)  as Filiere[],
    modules:   rawModules.map(normalizeModule)    as Module[],
    documents: rawDocuments.map(normalizeDocument) as Document[],
    isLoadingFilieres:  filieresQuery.isLoading,
    isLoadingDocuments: documentsQuery.isLoading,
    isErrorDocuments:   documentsQuery.isError,
    refetchDocuments:   documentsQuery.refetch,
    selectedFiliereId,
    selectedModuleId,
    setSelectedFiliereId,
    setSelectedModuleId,
    uploadDoc:    upload.mutate,
    isUploading:  upload.isPending,
    uploadProgress,
    reviewDoc:    review.mutate,
    isReviewing:  review.isPending,
  };
}
