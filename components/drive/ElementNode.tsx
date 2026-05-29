"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TypeFolderNode } from "./TypeFolderNode";
import { RenameModal } from "./admin/RenameModal";
import { DeleteConfirm } from "./admin/DeleteConfirm";
import { useAuth } from "@/lib/hooks/useAuth";
import type { ArborescenceElement } from "@/lib/types/drive";

interface ElementNodeProps {
  element: ArborescenceElement;
}

export function ElementNode({ element }: ElementNodeProps) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isSuperAdmin, isScolarite } = useAuth();
  const isAdmin = isSuperAdmin || isScolarite;

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
    <div className="ml-8">
      <div className="flex items-center group">
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex-1 flex items-center gap-2 px-4 py-2.5 hover:bg-muted/50 rounded-lg transition-colors text-left"
        >
          <ChevronRight
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground/50 transition-transform",
              open && "rotate-90",
            )}
          />
          {open ? (
            <FolderOpen className="size-4 shrink-0 text-yellow-400" />
          ) : (
            <Folder className="size-4 shrink-0 text-yellow-400" />
          )}
          <span className="text-sm text-foreground/70 flex-1">
            {element.nom}
          </span>
          {element.documents_count > 0 && (
            <span className="text-xs text-muted-foreground/50">
              {element.documents_count}
            </span>
          )}
        </button>

        {isAdmin && (
          <div
            ref={menuRef}
            className="relative pr-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((p) => !p);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <MoreHorizontal size={13} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-50 bg-[#1a1f2e] border border-white/10 rounded-xl shadow-xl min-w-[152px] py-1 overflow-hidden">
                <button
                  onClick={() => {
                    setRenaming(true);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-foreground/70 hover:text-foreground text-sm transition-colors"
                >
                  <Pencil size={12} />
                  Renommer
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  onClick={() => {
                    setDeleting(true);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 text-red-400 text-sm transition-colors"
                >
                  <Trash2 size={12} />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {open && (
        <div className="ml-6 space-y-0.5 pb-2">
          {element.types.length === 0 ? (
            <p className="text-muted-foreground text-xs px-4 py-1 italic">
              Aucun document
            </p>
          ) : (
            element.types.map((typeGroup) => (
              <TypeFolderNode key={typeGroup.type} typeGroup={typeGroup} />
            ))
          )}
        </div>
      )}

      <RenameModal
        isOpen={renaming}
        currentName={element.nom}
        endpoint={`/admin/drive/elements/${element.id}`}
        onClose={() => setRenaming(false)}
        onSuccess={() => setRenaming(false)}
      />

      <DeleteConfirm
        isOpen={deleting}
        name={element.nom}
        docsCount={element.documents_count}
        endpoint={`/admin/drive/elements/${element.id}`}
        onClose={() => setDeleting(false)}
        onSuccess={() => setDeleting(false)}
      />
    </div>
  );
}
