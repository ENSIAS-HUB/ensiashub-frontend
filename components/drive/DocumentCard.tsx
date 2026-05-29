"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Eye,
  BookOpen,
  FileCheck,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Document, DocumentType } from "@/lib/types";

const TYPE_CONFIG: Record<
  DocumentType,
  { label: string; color: string; icon: typeof FileText }
> = {
  cours: {
    label: "COURS",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: BookOpen,
  },
  examen: {
    label: "EXAM",
    color: "bg-[#B01817]/20 text-[#D42B2A] border-[#B01817]/30",
    icon: FileCheck,
  },
  resume: {
    label: "RÉSUMÉ",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: FileText,
  },
  td: {
    label: "TD",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    icon: FileText,
  },
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

interface DocumentCardProps {
  document: Document;
}

export function DocumentCard({ document: doc }: DocumentCardProps) {
  const {
    label,
    color,
    icon: TypeIcon,
  } = TYPE_CONFIG[doc.type] ?? TYPE_CONFIG.cours;

  return (
    <motion.div
      className="group flex items-center gap-4 px-4 py-3.5
        border-b border-border/50 last:border-0
        hover:bg-white/[0.02] transition-colors duration-150"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Type icon */}
      <div
        className={cn(
          "shrink-0 flex size-10 items-center justify-center rounded-xl border",
          color,
        )}
      >
        <TypeIcon className="size-5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold truncate">{doc.title}</p>
          <Badge
            variant="outline"
            className={`shrink-0 text-[9px] px-1.5 h-4 font-bold tracking-wider border ${color}`}
          >
            {label}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {doc.module?.name && (
            <span className="text-[11px] text-muted-foreground">
              {doc.module.name}
            </span>
          )}
          {doc.module?.semester && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-[11px] text-muted-foreground font-mono">
                S{doc.module.semester}
              </span>
            </>
          )}
          {doc.file_size > 0 && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {formatSize(doc.file_size)}
              </span>
            </>
          )}
          {doc.uploader?.name && doc.uploader.name !== "Inconnu" && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-[11px] text-muted-foreground">
                {doc.uploader.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions — visible on hover */}
      <div
        className="shrink-0 flex items-center gap-1
        opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Button
          variant="ghost"
          size="icon"
          className="size-7 rounded-lg text-muted-foreground
            hover:text-foreground hover:bg-muted"
          asChild
        >
          <a
            href={doc.preview_url || doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Eye className="size-3.5" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 rounded-lg text-muted-foreground
            hover:text-[#B01817] hover:bg-[#B01817]/10"
          asChild
        >
          <a href={doc.download_url || doc.file_url} download>
            <Download className="size-3.5" />
          </a>
        </Button>
      </div>
    </motion.div>
  );
}
