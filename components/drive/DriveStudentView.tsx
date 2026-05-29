"use client";

import { useState } from "react";
import { BookOpen, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SemestreNode } from "./SemestreNode";
import { useMesArborescence } from "@/lib/hooks/useDrive";
import UploadModal from "./UploadModal";

export function DriveStudentView() {
  const { data, isLoading, isError, refetch } = useMesArborescence();
  const [uploadOpen, setUploadOpen] = useState(false);

  const semestres = data?.arborescence ?? [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b dark:border-white/[0.06] border-black/[0.06] dark:bg-[#0d1117]/55 bg-white/55 backdrop-blur-sm flex items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <BookOpen className="size-4 text-[#B01817]" />
            The Drive
            {data?.annee && (
              <span className="text-muted-foreground font-normal">
                — {data.annee}
              </span>
            )}
          </h2>
          {semestres.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {semestres.length} semestre{semestres.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        <Button
          size="sm"
          className="bg-[#B01817] hover:bg-[#8f1211] text-white gap-1.5 h-8 text-xs"
          onClick={() => setUploadOpen(true)}
        >
          <Plus className="size-3.5" /> Importer
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 dark:bg-[#0d1117]/50 bg-white/50 backdrop-blur-sm">
        {isLoading ? (
          <>
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </>
        ) : isError ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
            <AlertCircle className="size-10 text-destructive" />
            <div>
              <p className="font-semibold">
                Impossible de charger les ressources
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Vérifiez votre connexion ou réessayez.
              </p>
            </div>
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
              Aucune ressource disponible
            </p>
          </div>
        ) : (
          semestres.map((sem) => (
            <SemestreNode key={sem.semestre} semestreGroup={sem} />
          ))
        )}
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
