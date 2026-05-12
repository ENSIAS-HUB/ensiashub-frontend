'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  Upload,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Plus,
  FlaskConical,
  FileCheck,
  GraduationCap,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { FiliereTree } from '@/components/drive/FiliereTree';
import { DocumentCard } from '@/components/drive/DocumentCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useDrive } from '@/lib/hooks/useDrive';
import { useAuthStore } from '@/lib/store/authStore';
import { cn } from '@/lib/utils';

const TYPE_BACKEND_MAP: Record<string, string> = {
  cours: 'Cours', td: 'TD', examen: 'Examen', resume: 'Autre',
};

const ACCEPTED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ACCEPTED_EXT = '.pdf,.doc,.docx';
const MAX_MB = 20;

export default function DrivePage() {
  const {
    filieres,
    modules,
    documents,
    isLoadingFilieres,
    isLoadingDocuments,
    isErrorDocuments,
    refetchDocuments,
    selectedFiliereId,
    selectedModuleId,
    setSelectedFiliereId,
    setSelectedModuleId,
    uploadDoc,
    isUploading,
    uploadProgress,
    reviewDoc,
    isReviewing,
  } = useDrive();

  const user = useAuthStore((s) => s.user);

  // Role-based access
  const UPLOAD_ROLES = ['superadmin', 'admin', 'delegue', 'professeur'];
  const REVIEW_ROLES = ['superadmin', 'admin', 'delegue', 'chef_scolarite'];
  const canUpload = UPLOAD_ROLES.includes(user?.role ?? '');
  const canReview = REVIEW_ROLES.includes(user?.role ?? '');

  // Subfolder tabs
  const SUBFOLDERS = [
    { key: 'all',    label: 'Tout',           icon: BookOpen },
    { key: 'cours',  label: 'Cours',          icon: BookOpen },
    { key: 'td',     label: 'TD / TP',        icon: FlaskConical },
    { key: 'examen', label: 'Anciens Examens', icon: FileCheck },
    { key: 'resume', label: "Laseq's",        icon: GraduationCap },
  ] as const;
  type SubfolderKey = typeof SUBFOLDERS[number]['key'];

  const [activeSubfolder, setActiveSubfolder] = useState<SubfolderKey>('all');
  const [search, setSearch] = useState('');

  // Upload dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSubfolder, setUploadSubfolder] = useState('cours');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_MIME.includes(file.type)) {
      toast.error('Format non supporté. Acceptés : PDF, DOC, DOCX.');
      return false;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Fichier trop lourd. Maximum ${MAX_MB} Mo.`);
      return false;
    }
    return true;
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) setSelectedFile(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) { toast.error('Sélectionnez un fichier.'); return; }
    if (!selectedModuleId) { toast.error('Sélectionnez un module dans l\'arbre.'); return; }

    const fd = new FormData();
    fd.append('fichier', selectedFile);
    fd.append('titre', selectedFile.name.replace(/\.[^.]+$/, ''));
    fd.append('typeDocument', TYPE_BACKEND_MAP[uploadSubfolder] ?? uploadSubfolder);
    fd.append('module_pedagogique_id', selectedModuleId);

    uploadDoc(fd, {
      onSuccess: () => {
        toast.success('Document uploadé avec succès !');
        setSelectedFile(null);
        setUploadSubfolder('cours');
        setDialogOpen(false);
      },
      onError: () => toast.error('Erreur lors de l\'upload. Réessayez.'),
    });
  };

  const handleReview = (id: string, decision: 'approved' | 'rejected') => {
    reviewDoc(
      { id, decision },
      {
        onSuccess: () =>
          toast.success(decision === 'approved' ? 'Document approuvé !' : 'Document rejeté.'),
        onError: () => toast.error('Erreur lors de la revue.'),
      }
    );
  };

  const filteredDocs = documents.filter((doc) => {
    const matchType = activeSubfolder === 'all' || doc.type === activeSubfolder;
    const matchSearch =
      search === '' || doc.title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left tree panel */}
      <aside className="w-64 shrink-0 border-r border-border bg-card/50 overflow-y-auto p-3">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Filières
        </p>
        {canUpload && (
          <div className="px-2 mb-3 flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-[#B01817]" />
            <span className="text-[10px] text-[#B01817] font-medium uppercase tracking-wider">
              {user?.role === 'superadmin' ? 'Super Admin'
                : user?.role === 'admin' ? 'Admin'
                : user?.role === 'delegue' ? 'Délégué'
                : 'Professeur'}
            </span>
          </div>
        )}
        <FiliereTree
          filieres={filieres}
          modules={modules}
          isLoading={isLoadingFilieres}
          selectedFiliereId={selectedFiliereId}
          selectedModuleId={selectedModuleId}
          onSelectFiliere={setSelectedFiliereId}
          onSelectModule={setSelectedModuleId}
        />
      </aside>

      {/* Right documents grid */}
      <main className="flex-1 overflow-y-auto p-6 relative">
        <div className="mb-5 space-y-3">
          {/* Row 1: title + upload button */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <BookOpen className="size-4 text-[#B01817]" />
                {selectedModuleId
                  ? modules.find(m => m.id === selectedModuleId)?.name ?? 'Module'
                  : selectedFiliereId
                  ? filieres.find(f => f.id === selectedFiliereId)?.name ?? 'Filière'
                  : 'The Drive'}
              </h2>
              {documents.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {filteredDocs.length} document{filteredDocs.length > 1 ? 's' : ''}
                  {activeSubfolder !== 'all' && ` · ${SUBFOLDERS.find(s => s.key === activeSubfolder)?.label}`}
                </p>
              )}
            </div>

            {/* Upload button — authorized roles only */}
            {selectedModuleId && canUpload && (
              <Button
                size="sm"
                className="bg-[#B01817] hover:bg-[#8f1211] text-white gap-1.5 h-8 text-xs"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="size-3.5" />
                Importer
              </Button>
            )}
          </div>

          {/* Row 2: subfolder tabs — only when a module is selected */}
          {selectedModuleId && (
            <div className="flex items-center gap-2 flex-wrap">
              {SUBFOLDERS.map((sf) => {
                const count =
                  sf.key === 'all'
                    ? documents.length
                    : documents.filter(d => d.type === sf.key).length;
                const Icon = sf.icon;
                return (
                  <button
                    key={sf.key}
                    onClick={() => setActiveSubfolder(sf.key)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                      'text-xs font-medium border transition-all duration-150',
                      activeSubfolder === sf.key
                        ? 'bg-[#B01817] border-[#B01817] text-white shadow-[0_0_10px_rgba(176,24,23,0.3)]'
                        : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground bg-transparent',
                    )}
                  >
                    <Icon className="size-3" />
                    {sf.label}
                    <span
                      className={cn(
                        'text-[10px] font-mono ml-0.5',
                        activeSubfolder === sf.key ? 'text-white/80' : 'text-muted-foreground/60',
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}

              {/* Search */}
              {documents.length > 0 && (
                <div className="relative ml-auto">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher…"
                    className="pl-8 h-7 w-44 text-xs bg-muted/50 border-border/50 focus:border-[#B01817]/50"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {!selectedFiliereId && !selectedModuleId ? (
          <EmptyState
            icon={BookOpen}
            title="Sélectionnez une filière"
            description="Naviguez dans l'arbre à gauche pour explorer les documents."
          />
        ) : isLoadingDocuments ? (
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border/50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                <Skeleton className="size-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : isErrorDocuments ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
            <AlertCircle className="size-10 text-destructive" />
            <div>
              <p className="font-semibold">Impossible de charger les documents</p>
              <p className="text-sm text-muted-foreground mt-1">Vérifiez votre connexion ou réessayez.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchDocuments()} className="gap-2">
              <RefreshCw className="size-4" />
              Réessayer
            </Button>
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aucun document"
            description="Aucun document disponible pour cette sélection."
          />
        ) : filteredDocs.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-2">
            <Search className="size-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground">Aucun résultat</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {filteredDocs.map((doc) => (
              <div key={doc.id}>
                <DocumentCard document={doc} />
                {canReview && doc.status === 'pending' && (
                  <div className="flex gap-2 px-4 pb-3 -mt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isReviewing}
                      onClick={() => handleReview(doc.id, 'approved')}
                      className="flex-1 h-7 text-xs gap-1 border-green-500/40 text-green-400 hover:bg-green-500/10"
                    >
                      <CheckCircle2 className="size-3.5" />
                      Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isReviewing}
                      onClick={() => handleReview(doc.id, 'rejected')}
                      className="flex-1 h-7 text-xs gap-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="size-3.5" />
                      Rejeter
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Upload dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!isUploading) setDialogOpen(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Uploader un document</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Subfolder selector */}
            <div className="grid grid-cols-2 gap-2">
              {SUBFOLDERS.filter(s => s.key !== 'all').map((sf) => {
                const Icon = sf.icon;
                return (
                  <button
                    key={sf.key}
                    onClick={() => setUploadSubfolder(sf.key)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-xl border text-sm',
                      'transition-all duration-150 text-left',
                      uploadSubfolder === sf.key
                        ? 'bg-[#B01817]/10 border-[#B01817]/50 text-[#B01817]'
                        : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="text-xs font-medium">{sf.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Drag & drop zone */}
            <div
              className={cn(
                'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
                dragOver
                  ? 'border-[#B01817] bg-[#B01817]/5'
                  : selectedFile
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-border hover:border-[#B01817]/50 hover:bg-[#B01817]/5'
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXT}
                className="hidden"
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <>
                  <CheckCircle2 className="size-8 text-green-400" />
                  <p className="text-sm font-medium text-green-400">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} Mo
                  </p>
                </>
              ) : (
                <>
                  <Upload className="size-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Glissez votre fichier ici</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ou cliquez pour parcourir · PDF, DOC, DOCX · max {MAX_MB} Mo
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Progress bar */}
            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Upload en cours…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    className="h-full rounded-full bg-[#B01817]"
                    style={{ width: `${uploadProgress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.3 }}
                  />
                </div>
              </div>
            )}

          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isUploading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className="bg-[#B01817] hover:bg-[#8f1211] text-white gap-2"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Upload…
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Uploader
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
