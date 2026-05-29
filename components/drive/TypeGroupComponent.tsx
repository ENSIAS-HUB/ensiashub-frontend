"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentRow } from "./DocumentRow";
import type { TypeGroup } from "@/lib/types/drive";

interface TypeGroupComponentProps {
  group: TypeGroup;
}

const TYPE_COLORS: Record<string, string> = {
  Cours: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  TD: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  TP: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Examen: "bg-red-500/10 text-red-400 border-red-500/20",
  "Corrigé": "bg-green-500/10 text-green-400 border-green-500/20",
  "Résumé": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Projet: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

export function TypeGroupComponent({ group }: TypeGroupComponentProps) {
  const [open, setOpen] = useState(false);
  const colorClass = TYPE_COLORS[group.type] ?? "bg-muted text-muted-foreground border-border";

  return (
    <div className="rounded-md border border-border/50 overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/40 transition-colors text-left"
      >
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 transition-transform text-muted-foreground",
            open && "rotate-90"
          )}
        />
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded border", colorClass)}>
          {group.type}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">{group.count}</span>
      </button>

      {open && (
        <div className="border-t border-border/50 bg-muted/20 px-1 py-1 space-y-0.5">
          {group.documents.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
