"use client";

import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useSyncStatus } from "@/lib/hooks/useDrive";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";

export function SyncIndicator() {
  const { isSuperAdmin, isScolarite } = useAuth();

  const { data, isLoading } = useSyncStatus(isSuperAdmin || isScolarite);

  if (!isSuperAdmin && !isScolarite) return null;
  if (isLoading || !data) return null;

  if (data.failed_jobs > 0) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10",
          "px-2.5 py-1 text-xs font-medium text-destructive",
        )}
        title={`${data.failed_jobs} job(s) Azure échoué(s)`}
      >
        <AlertTriangle className="size-3.5 shrink-0" />
        <span>{data.failed_jobs} erreur(s) Azure</span>
      </div>
    );
  }

  if (data.is_syncing) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-amber-400/30 bg-amber-50 dark:bg-amber-950/20",
          "px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400",
        )}
        title={`${data.pending_jobs} job(s) Azure en attente`}
      >
        <Loader2 className="size-3.5 shrink-0 animate-spin" />
        <span>Sync Azure…</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md border border-green-400/30 bg-green-50 dark:bg-green-950/20",
        "px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400",
      )}
      title="Azure synchronisé"
    >
      <CheckCircle2 className="size-3.5 shrink-0" />
      <span>Synchronisé</span>
    </div>
  );
}
