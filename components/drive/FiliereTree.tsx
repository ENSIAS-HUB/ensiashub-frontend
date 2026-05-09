'use client';

import { ChevronRight, ChevronDown, BookOpen, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Filiere, Module } from '@/lib/types';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface FiliereTreeProps {
  filieres: Filiere[];
  modules: Module[];
  isLoading: boolean;
  selectedFiliereId: string | null;
  selectedModuleId: string | null;
  onSelectFiliere: (id: string) => void;
  onSelectModule: (id: string) => void;
}

export function FiliereTree({
  filieres,
  modules,
  isLoading,
  selectedFiliereId,
  selectedModuleId,
  onSelectFiliere,
  onSelectModule,
}: FiliereTreeProps) {
  const [expandedFilieres, setExpandedFilieres] = useState<Set<string>>(new Set());

  const toggleFiliere = (id: string) => {
    onSelectFiliere(id);
    setExpandedFilieres((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {filieres.map((filiere) => {
        const isExpanded = expandedFilieres.has(filiere.id);
        const isSelected = selectedFiliereId === filiere.id;
        const filiereModules = modules.filter((m) => m.filiere_id === filiere.id);

        return (
          <div key={filiere.id}>
            <button
              onClick={() => toggleFiliere(filiere.id)}
              className={cn(
                'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors',
                isSelected ? 'bg-[#B01817]/15 text-[#B01817]' : 'hover:bg-muted text-foreground'
              )}
            >
              {isExpanded ? (
                <ChevronDown className="size-3.5 shrink-0" />
              ) : (
                <ChevronRight className="size-3.5 shrink-0" />
              )}
              <BookOpen className="size-3.5 shrink-0" />
              <span className="truncate font-medium">{filiere.name}</span>
              <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 rounded">
                {filiere.code}
              </span>
            </button>

            {isExpanded && (
              <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border pl-3">
                {isLoading && !filiereModules.length ? (
                  <div className="py-2 space-y-1.5">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}
                  </div>
                ) : filiereModules.length === 0 ? (
                  <p className="px-2 py-2 text-xs text-muted-foreground">Aucun module</p>
                ) : (
                  filiereModules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => onSelectModule(module.id)}
                      className={cn(
                        'w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-xs text-left transition-colors',
                        selectedModuleId === module.id
                          ? 'bg-[#B01817]/10 text-[#B01817]'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Layers className="size-3 shrink-0" />
                      <span className="truncate">{module.name}</span>
                      <span className="ml-auto text-[10px] bg-muted rounded px-1">
                        S{module.semester}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
