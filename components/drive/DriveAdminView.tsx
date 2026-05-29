"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SemestreNode } from "./SemestreNode";
import { useDriveFilieres2, useDriveArborescence } from "@/lib/hooks/useDrive";
import UploadModal from "./UploadModal";
import type { DriveFiliere2 } from "@/lib/types/drive";

const ANNEES = ["1A", "2A", "3A"];

export function DriveAdminView() {
  const { data: filieres, isLoading: loadingFilieres } = useDriveFilieres2();
  const [selectedFiliere, setSelectedFiliere] = useState<DriveFiliere2 | null>(
    null,
  );
  const [selectedAnnee, setSelectedAnnee] = useState<string>("1A");
  const [uploadOpen, setUploadOpen] = useState(false);

  const {
    data,
    isLoading: loadingArbo,
    isError,
    refetch,
  } = useDriveArborescence(selectedFiliere?.id ?? null, selectedAnnee);

  const semestres = data?.arborescence ?? [];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r dark:border-white/[0.06] border-black/[0.06] dark:bg-[#0d1117]/55 bg-white/55 backdrop-blur-sm overflow-y-auto flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Filières
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loadingFilieres ? (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
              ))}
            </>
          ) : (
            filieres?.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFiliere(f)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left",
                  selectedFiliere?.id === f.id
                    ? "bg-[#B01817]/10 text-[#B01817] border border-[#B01817]/20"
                    : "hover:bg-muted/50 text-foreground",
                )}
              >
                {f.badge && (
                  <span className="text-xs font-bold w-7 text-center shrink-0">
                    {f.badge}
                  </span>
                )}
                <span className="truncate flex-1">{f.nom}</span>
                {f.modules_count > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {f.modules_count}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-3 border-b dark:border-white/[0.06] border-black/[0.06] dark:bg-[#0d1117]/55 bg-white/55 backdrop-blur-sm flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-[#B01817]" />
            <span className="text-sm font-semibold">
              {selectedFiliere
                ? selectedFiliere.nom
                : "Sélectionnez une filière"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-border overflow-hidden">
              {ANNEES.map((a) => (
                <button
                  key={a}
                  onClick={() => setSelectedAnnee(a)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium transition-colors",
                    selectedAnnee === a
                      ? "bg-[#B01817] text-white"
                      : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              className="bg-[#B01817] hover:bg-[#8f1211] text-white gap-1.5 h-7 text-xs"
              onClick={() => setUploadOpen(true)}
            >
              <Plus className="size-3.5" /> Importer
            </Button>
          </div>
        </div>

        {/* Arborescence */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 dark:bg-[#0d1117]/50 bg-white/50 backdrop-blur-sm">
          {!selectedFiliere ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <ChevronRight className="size-10 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">
                Sélectionnez une filière dans la barre latérale
              </p>
            </div>
          ) : loadingArbo ? (
            <>
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </>
          ) : isError ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
              <AlertCircle className="size-10 text-destructive" />
              <p className="font-semibold">
                Impossible de charger l&apos;arborescence
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-2"
              >
                <RefreshCw className="size-4" /> Réessayer
              </Button>
            </div>
          ) : semestres.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <BookOpen className="size-10 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">
                Aucun contenu pour {selectedFiliere.nom} · {selectedAnnee}
              </p>
            </div>
          ) : (
            semestres.map((sem) => (
              <SemestreNode key={sem.semestre} semestreGroup={sem} />
            ))
          )}
        </div>
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
