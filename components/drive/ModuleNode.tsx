"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  BookOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ElementNode } from "./ElementNode";
import { RenameModal } from "./admin/RenameModal";
import { DeleteConfirm } from "./admin/DeleteConfirm";
import { useAuth } from "@/lib/hooks/useAuth";
import type { ArborescenceModule } from "@/lib/types/drive";

interface ModuleNodeProps {
  module: ArborescenceModule;
}

export function ModuleNode({ module }: ModuleNodeProps) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isSuperAdmin, isScolarite } = useAuth();
  const isAdmin = isSuperAdmin || isScolarite;

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div>
      <div className="flex items-center group">
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex-1 flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors text-left"
        >
          <ChevronRight
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-90",
            )}
          />
          <BookOpen className="size-4 shrink-0 text-[#B01817]" />
          <span className="text-sm font-medium text-foreground/90 flex-1">
            {module.nom}
          </span>
          {module.documents_count > 0 && (
            <span className="text-xs text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-full">
              {module.documents_count}
            </span>
          )}
        </button>

        {isAdmin && (
          <div
            ref={menuRef}
            className="relative pr-3 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((p) => !p);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <MoreHorizontal size={15} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-50 bg-[#1a1f2e] border border-white/10 rounded-xl shadow-xl min-w-[168px] py-1 overflow-hidden">
                <button
                  onClick={() => {
                    setRenaming(true);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-foreground/70 hover:text-foreground text-sm transition-colors"
                >
                  <Pencil size={13} />
                  Renommer
                </button>
                <button
                  onClick={() => {
                    /* TODO: ajouter élément */ setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-foreground/70 hover:text-foreground text-sm transition-colors"
                >
                  <FolderPlus size={13} />
                  Ajouter un élément
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  onClick={() => {
                    setDeleting(true);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 text-red-400 text-sm transition-colors"
                >
                  <Trash2 size={13} />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {open && (
        <div className="bg-muted/10">
          {module.elements.length === 0 ? (
            <p className="px-14 py-2 text-xs text-muted-foreground italic">
              Aucun élément disponible
            </p>
          ) : (
            module.elements.map((el) => (
              <ElementNode key={el.id} element={el} />
            ))
          )}
        </div>
      )}

      <RenameModal
        isOpen={renaming}
        currentName={module.nom}
        endpoint={`/admin/drive/modules/${module.id}`}
        onClose={() => setRenaming(false)}
        onSuccess={() => setRenaming(false)}
      />

      <DeleteConfirm
        isOpen={deleting}
        name={module.nom}
        docsCount={module.documents_count}
        endpoint={`/admin/drive/modules/${module.id}`}
        onClose={() => setDeleting(false)}
        onSuccess={() => setDeleting(false)}
      />
    </div>
  );
}
