'use client';

import { BookOpen, FileText } from 'lucide-react';
import { FiliereTree } from '@/components/drive/FiliereTree';
import { DocumentCard } from '@/components/drive/DocumentCard';
import { EmptyState } from '@/components/common/EmptyState';
import { AnimatedList } from '@/components/common/AnimatedList';
import { Skeleton } from '@/components/ui/skeleton';
import { useDrive } from '@/lib/hooks/useDrive';

export default function DrivePage() {
  const {
    filieres,
    modules,
    documents,
    isLoadingFilieres,
    isLoadingDocuments,
    selectedFiliereId,
    selectedModuleId,
    setSelectedFiliereId,
    setSelectedModuleId,
  } = useDrive();

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left tree panel */}
      <aside className="w-64 shrink-0 border-r border-border bg-card/50 overflow-y-auto p-3">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Filières
        </p>
        <FiliereTree
          filieres={filieres}
          modules={modules}
          isLoading={isLoadingFilieres}
          selectedFiliereId={selectedFiliereId}
          selectedModuleId={selectedModuleId}
          onSelectFiliere={setSelectedFiliereId}
          onSelectModule={setSelectedModuleId}
        />
      </aside>

      {/* Right documents grid */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <BookOpen className="size-4 text-[#B01817]" />
            {selectedModuleId
              ? modules.find((m) => m.id === selectedModuleId)?.name ?? 'Module'
              : selectedFiliereId
              ? filieres.find((f) => f.id === selectedFiliereId)?.name ?? 'Filière'
              : 'The Drive'}
          </h2>
          <span className="text-xs text-muted-foreground">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </span>
        </div>

        {!selectedFiliereId && !selectedModuleId ? (
          <EmptyState
            icon={BookOpen}
            title="Sélectionnez une filière"
            description="Naviguez dans l'arbre à gauche pour explorer les documents."
          />
        ) : isLoadingDocuments ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aucun document"
            description="Aucun document disponible pour cette sélection."
          />
        ) : (
          <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </AnimatedList>
        )}
      </main>
    </div>
  );
}
