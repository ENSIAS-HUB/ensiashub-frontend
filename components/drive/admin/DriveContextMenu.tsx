"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContextMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  isDanger?: boolean;
  isDivider?: boolean;
}

interface DriveContextMenuProps {
  items: ContextMenuItem[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  /** Taille du bouton déclencheur */
  iconSize?: number;
  /** Classes additionnelles sur le conteneur wrapper */
  className?: string;
}

/**
 * Menu contextuel ⋯ réutilisable pour modules, éléments et documents.
 * Gère la fermeture au clic extérieur via un ref.
 */
export function DriveContextMenu({
  items,
  isOpen,
  onOpen,
  onClose,
  iconSize = 14,
  className,
}: DriveContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          isOpen ? onClose() : onOpen();
        }}
        className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Actions"
      >
        <MoreHorizontal size={iconSize} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 z-50 bg-[#1a1f2e] border border-white/10 rounded-xl shadow-xl min-w-[160px] py-1 overflow-hidden">
          {items.map((item, idx) =>
            item.isDivider ? (
              <div key={idx} className="h-px bg-white/10 my-1" />
            ) : (
              <button
                key={idx}
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                  item.isDanger
                    ? "hover:bg-red-500/10 text-red-400"
                    : "hover:bg-white/5 text-foreground/70 hover:text-foreground",
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
