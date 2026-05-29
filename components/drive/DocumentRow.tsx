"use client";

import { useState } from "react";
import {
  Download,
  FileText,
  Bookmark,
  BookmarkCheck,
  Pencil,
  Trash2,
  MoveRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api/client";
import { downloadDriveDocument } from "@/lib/api/drive";
import { useAuth } from "@/lib/hooks/useAuth";
import { DriveContextMenu } from "./admin/DriveContextMenu";
import { RenameModal } from "./admin/RenameModal";
import { MoveModal } from "./admin/MoveModal";
import type { DriveDocument2 } from "@/lib/types/drive";
import { cn } from "@/lib/utils";

interface DocumentRowProps {
  doc: DriveDocument2;
}

const EXT_COLORS: Record<string, string> = {
  pdf: "text-red-400",
  docx: "text-blue-400",
  doc: "text-blue-400",
  pptx: "text-orange-400",
  xlsx: "text-green-400",
};

export function DocumentRow({ doc }: DocumentRowProps) {
  const qc = useQueryClient();
  const { isSuperAdmin, isScolarite } = useAuth();
  const isAdmin = isSuperAdmin || isScolarite;

  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [moving, setMoving] = useState(false);

  const ext = doc.extension?.toLowerCase() ?? "pdf";
  const extColor = EXT_COLORS[ext] ?? "text-muted-foreground";

  const download = useMutation({
    mutationFn: () => downloadDriveDocument(doc.id),
    onSuccess: (url) => window.open(url, "_blank"),
    onError: () => toast.error("Impossible de télécharger le fichier."),
  });

  const toggleSave = useMutation({
    mutationFn: () =>
      apiClient.post(`/documents/${doc.id}/save`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drive-elements"] });
    },
    onError: () => toast.error("Erreur lors de la sauvegarde."),
  });

  const deleteDoc = useMutation({
    mutationFn: () => apiClient.delete(`/admin/drive/documents/${doc.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drive-arborescence"] });
      qc.invalidateQueries({ queryKey: ["drive-mes-arborescence"] });
      toast.success("Document supprimé. Sync Azure en cours…");
    },
    onError: () => toast.error("Impossible de supprimer le document."),
  });

  const adminMenuItems = isAdmin
    ? [
        {
          label: "Renommer",
          icon: <Pencil size={12} />,
          onClick: () => setRenaming(true),
        },
        {
          label: "Déplacer",
          icon: <MoveRight size={12} />,
          onClick: () => setMoving(true),
        },
        { isDivider: true, label: "", onClick: () => {} },
        {
          label: "Supprimer",
          icon: <Trash2 size={12} />,
          onClick: () => deleteDoc.mutate(),
          isDanger: true,
        },
      ]
    : [];

  return (
    <>
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors group">
        <FileText className={cn("size-4 shrink-0", extColor)} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{doc.titre}</p>
          <p className="text-xs text-muted-foreground">
            {doc.taille_formatee}
            {doc.uploader && (
              <>
                {" "}
                · {doc.uploader.prenom} {doc.uploader.nom}
              </>
            )}
            <> · {doc.telechargements} DL</>
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isAdmin && (
            <DriveContextMenu
              items={adminMenuItems}
              isOpen={menuOpen}
              onOpen={() => setMenuOpen(true)}
              onClose={() => setMenuOpen(false)}
              iconSize={13}
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => toggleSave.mutate()}
            disabled={toggleSave.isPending}
            title={doc.is_saved ? "Retirer des favoris" : "Sauvegarder"}
          >
            {doc.is_saved ? (
              <BookmarkCheck className="size-3.5 text-yellow-400" />
            ) : (
              <Bookmark className="size-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => download.mutate()}
            disabled={download.isPending}
            title="Télécharger"
          >
            <Download className="size-3.5" />
          </Button>
        </div>
      </div>

      {isAdmin && (
        <>
          <RenameModal
            isOpen={renaming}
            currentName={doc.titre}
            endpoint={`/admin/drive/documents/${doc.id}/rename`}
            fieldName="titre"
            onClose={() => setRenaming(false)}
            onSuccess={() => setRenaming(false)}
          />
          <MoveModal
            isOpen={moving}
            doc={doc}
            onClose={() => setMoving(false)}
            onSuccess={() => setMoving(false)}
          />
        </>
      )}
    </>
  );
}
