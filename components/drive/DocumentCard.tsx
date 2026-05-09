'use client';

import { motion } from 'framer-motion';
import { FileText, Download, Eye, BookOpen, FlaskConical, FileCheck, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Document, DocumentType } from '@/lib/types';

const TYPE_CONFIG: Record<DocumentType, { label: string; color: string; icon: typeof FileText }> = {
  cours:   { label: 'COURS',   color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',    icon: BookOpen },
  examen:  { label: 'EXAM',    color: 'bg-[#B01817]/20 text-[#D42B2A] border-[#B01817]/30', icon: FileCheck },
  resume:  { label: 'RÉSUMÉ',  color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: FileText },
  td:      { label: 'TD',      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: FlaskConical },
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
  const { label, color, icon: TypeIcon } = TYPE_CONFIG[doc.type] ?? TYPE_CONFIG.cours;
  const initials = doc.uploader.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      className="group relative rounded-xl border border-border bg-card p-4 space-y-3 hover:border-[#B01817]/30 hover:shadow-[0_0_12px_rgba(176,24,23,0.08)] transition-all"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Type icon */}
      <div className="flex items-start justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <TypeIcon className="size-5 text-muted-foreground" />
        </div>
        <Badge variant="outline" className={`text-[10px] px-1.5 h-5 font-semibold tracking-wide border ${color}`}>
          {label}
        </Badge>
      </div>

      {/* Title & meta */}
      <div>
        <p className="text-sm font-semibold leading-snug line-clamp-2">{doc.title}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {doc.module.name} · Sem. {doc.module.semester}
        </p>
        <p className="text-xs text-muted-foreground">Par : {doc.uploader.name}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
        <span className="text-xs text-muted-foreground mr-auto">
          {formatSize(doc.file_size)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          asChild
        >
          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
            <Eye className="size-3.5" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-[#B01817]"
          asChild
        >
          <a href={doc.file_url} download>
            <Download className="size-3.5" />
          </a>
        </Button>
      </div>
    </motion.div>
  );
}
