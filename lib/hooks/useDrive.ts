'use client';

import { useQuery } from '@tanstack/react-query';
import { getFilieres, getModules, getDocuments } from '@/lib/api/drive';
import { useState } from 'react';

export function useDrive() {
  const [selectedFiliereId, setSelectedFiliereId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  const filieres = useQuery({
    queryKey: ['filieres'],
    queryFn: () => getFilieres(),
  });

  const modules = useQuery({
    queryKey: ['modules', selectedFiliereId],
    queryFn: () => getModules(selectedFiliereId ?? undefined),
    enabled: !!selectedFiliereId,
  });

  const documents = useQuery({
    queryKey: ['documents', selectedModuleId, selectedFiliereId],
    queryFn: () => getDocuments(selectedModuleId ?? undefined, selectedFiliereId ?? undefined),
    enabled: !!(selectedModuleId || selectedFiliereId),
  });

  return {
    filieres: filieres.data?.data.data ?? [],
    modules: modules.data?.data.data ?? [],
    documents: documents.data?.data.data ?? [],
    isLoadingFilieres: filieres.isLoading,
    isLoadingDocuments: documents.isLoading,
    selectedFiliereId,
    selectedModuleId,
    setSelectedFiliereId,
    setSelectedModuleId,
  };
}
