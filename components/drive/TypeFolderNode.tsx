"use client";

import { useState } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  Download,
  Eye,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api/client";
import { DocumentViewerModal } from "./DocumentViewerModal";
import type { ArborescenceTypeGroup } from "@/lib/types/drive";

const TYPE_STYLE: Record<string, { folder: string; badge: string }> = {
  Cours: { folder: "text-blue-400", badge: "bg-blue-500/15 text-blue-400" },
  "TD/TP": {
    folder: "text-orange-400",
    badge: "bg-orange-500/15 text-orange-400",
  },
  "Anciens examens": {
    folder: "text-[#B01817]",
    badge: "bg-[#B01817]/15 text-[#B01817]",
  },
  Résumé: {
    folder: "text-purple-400",
    badge: "bg-purple-500/15 text-purple-400",
  },
  Projet: { folder: "text-green-400", badge: "bg-green-500/15 text-green-400" },
  Autre: {
    folder: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
};

const EXT_COLORS: Record<string, string> = {
  pdf: "text-red-400",
  docx: "text-blue-400",
  doc: "text-blue-400",
  pptx: "text-orange-400",
  xlsx: "text-green-400",
};

const VIEWABLE_EXTS = [
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
];

function DownloadButton({
  docId,
  azureUrl,
}: {
  docId: string;
  azureUrl: string | null;
}) {
  const mutation = useMutation({
    mutationFn: () =>
      apiClient
        .get<{ url: string }>(`/drive/documents/${docId}/download`)
        .then((r) => r.data.url ?? azureUrl),
    onSuccess: (url) => {
      if (url) window.open(url, "_blank");
    },
    onError: () => {
      if (azureUrl) window.open(azureUrl, "_blank");
      else toast.error("Impossible de télécharger le fichier.");
    },
  });

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        mutation.mutate();
      }}
      disabled={mutation.isPending}
      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1
                 text-xs bg-[#B01817]/15 hover:bg-[#B01817]/30 text-[#B01817] px-2 py-1
                 rounded-md font-medium shrink-0 disabled:opacity-50"
      title="Télécharger"
    >
      <Download className="size-3" />
      DL
    </button>
  );
}

function ViewButton({
  docId,
  onView,
}: {
  docId: string;
  onView: (id: string) => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onView(docId);
      }}
      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1
                 text-xs bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground
                 px-2 py-1 rounded-md font-medium shrink-0"
      title="Visualiser"
    >
      <Eye className="size-3" />
      Voir
    </button>
  );
}

interface TypeFolderNodeProps {
  typeGroup: ArborescenceTypeGroup;
}

export function TypeFolderNode({ typeGroup }: TypeFolderNodeProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const style = TYPE_STYLE[typeGroup.type] ?? TYPE_STYLE["Autre"];

  return (
    <>
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 rounded-lg transition-colors text-left"
        >
          <ChevronRight
            className={`size-3 text-muted-foreground/50 transition-transform shrink-0 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
          {isOpen ? (
            <FolderOpen className={`size-3.5 shrink-0 ${style.folder}`} />
          ) : (
            <Folder className={`size-3.5 shrink-0 ${style.folder}`} />
          )}
          <span className="text-muted-foreground text-xs font-medium flex-1">
            {typeGroup.type}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${style.badge}`}>
            {typeGroup.count}
          </span>
        </button>

        {isOpen && (
          <div className="ml-5 space-y-0.5 pb-1">
            {typeGroup.documents.map((doc) => {
              const ext = doc.extension?.toLowerCase() ?? "";
              const extColor = EXT_COLORS[ext] ?? "text-muted-foreground";
              const label = doc.titre || doc.nom_original || "Document";

              return (
                <div
                  key={doc.id}
                  onClick={() =>
                    VIEWABLE_EXTS.includes(ext) && setViewingDocId(doc.id)
                  }
                  className={`flex items-center gap-2 px-3 py-2 hover:bg-muted/40 rounded-lg group transition-colors ${VIEWABLE_EXTS.includes(ext) ? "cursor-pointer" : ""}`}
                >
                  <FileText className={`size-3.5 shrink-0 ${extColor}`} />
                  <span
                    className="text-sm text-foreground/80 flex-1 truncate"
                    title={label}
                  >
                    {label}
                  </span>
                  {ext && (
                    <span className="text-muted-foreground/50 text-xs uppercase shrink-0">
                      {ext}
                    </span>
                  )}
                  <div onClick={(e) => e.stopPropagation()}>
                    <DownloadButton docId={doc.id} azureUrl={doc.azure_url} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DocumentViewerModal
        documentId={viewingDocId}
        isOpen={viewingDocId !== null}
        onClose={() => setViewingDocId(null)}
      />
    </>
  );
}
