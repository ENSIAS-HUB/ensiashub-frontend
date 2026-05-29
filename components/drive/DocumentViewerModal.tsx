"use client";

import { useState, useEffect } from "react";
import { X, Download, Loader2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import apiClient from "@/lib/api/client";
import { PDFViewer } from "./PDFViewer";

interface ViewerData {
  id: string;
  titre: string;
  extension: string;
  mime_type: string;
  file_url: string;
  view_mode: "pdf" | "image" | "office" | "download";
  viewer_url: string | null;
}

interface DocumentViewerModalProps {
  documentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentViewerModal({
  documentId,
  isOpen,
  onClose,
}: DocumentViewerModalProps) {
  const [data, setData] = useState<ViewerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !documentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    apiClient
      .get(`/drive/documents/${documentId}/view`)
      .then((r) => setData(r.data))
      .catch((e) =>
        setError(e?.response?.data?.error ?? "Erreur de chargement"),
      )
      .finally(() => setLoading(false));
  }, [documentId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d1117] border border-white/10 rounded-2xl w-[90vw] !max-w-none h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {data?.titre ?? "Visualiseur de document"}
        </DialogTitle>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-sm truncate">
              {data?.titre ?? (loading ? "Chargement..." : "Document")}
            </h2>
            {data && (
              <p className="text-white/30 text-xs mt-0.5 uppercase">
                {data.extension} · {data.view_mode}
              </p>
            )}
          </div>

          {data && (
            <a
              href={data.file_url}
              download={data.titre}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium shrink-0"
            >
              <Download size={13} />
              Télécharger
            </a>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin text-red-400" />
                <p className="text-white/40 text-sm">
                  Chargement du document...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]">
              <div className="flex flex-col items-center gap-3 text-center px-6">
                <AlertCircle size={32} className="text-red-400" />
                <p className="text-white font-medium">Impossible de charger</p>
                <p className="text-white/40 text-sm">{error}</p>
              </div>
            </div>
          )}

          {data?.view_mode === "pdf" && data.file_url && (
            <PDFViewer url={data.file_url} />
          )}
          {data?.view_mode === "pdf" && !data.file_url && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0d1117]">
              <p className="text-white/40 text-sm">Aperçu PDF non disponible</p>
            </div>
          )}

          {data?.view_mode === "image" && (
            <div className="w-full h-full flex items-center justify-center bg-black/20 overflow-auto p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.file_url}
                alt={data.titre}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          )}

          {data?.view_mode === "office" && data.viewer_url && (
            <iframe
              src={data.viewer_url}
              className="w-full h-full border-0"
              title={data.titre}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          )}

          {data?.view_mode === "download" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center bg-[#0d1117]">
              <div className="text-5xl">📁</div>
              <p className="text-white font-medium">
                Aperçu non disponible pour ce format
              </p>
              <p className="text-white/40 text-sm">.{data.extension}</p>
              <a
                href={data.file_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm px-5 py-2.5 rounded-xl transition-colors font-medium"
              >
                <Download size={15} />
                Télécharger le fichier
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
