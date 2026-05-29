"use client";

import { useState } from "react";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { ModuleNode } from "./ModuleNode";
import type { SemestreGroup } from "@/lib/types/drive";

interface SemestreNodeProps {
  semestreGroup: SemestreGroup;
}

export function SemestreNode({ semestreGroup }: SemestreNodeProps) {
  const [isOpen, setIsOpen] = useState(true);

  const totalDocs = semestreGroup.modules.reduce(
    (acc, m) => acc + m.documents_count,
    0,
  );

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      {/* Header semestre */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-5 py-4 dark:bg-white/[0.04] bg-black/[0.03] dark:hover:bg-white/[0.05] hover:bg-black/[0.05] transition-colors text-left"
      >
        <ChevronRight
          className={`size-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
        {isOpen ? (
          <FolderOpen className="size-5 text-[#B01817] shrink-0" />
        ) : (
          <Folder className="size-5 text-[#B01817] shrink-0" />
        )}

        <span className="text-foreground font-bold text-base flex-1">
          {semestreGroup.semestre}
        </span>

        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm">
            {semestreGroup.modules.length} module
            {semestreGroup.modules.length > 1 ? "s" : ""}
          </span>
          {totalDocs > 0 && (
            <span className="bg-[#B01817]/20 text-[#B01817] text-xs px-2.5 py-1 rounded-full font-medium">
              {totalDocs} doc{totalDocs > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </button>

      {/* Modules du semestre */}
      {isOpen && (
        <div className="divide-y divide-border/40">
          {semestreGroup.modules.map((module) => (
            <ModuleNode key={module.id} module={module} />
          ))}
        </div>
      )}
    </div>
  );
}
