"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface PDFViewerProps {
  url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full bg-[#0d1117]">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin text-red-400" />
            <p className="text-white/40 text-sm">Chargement du PDF...</p>
          </div>
        </div>
      )}
      {url ? (
        <iframe
          src={url}
          className="w-full h-full border-0 rounded-b-2xl"
          title="PDF Viewer"
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/40 text-sm">Fichier non disponible</p>
        </div>
      )}
    </div>
  );
}
