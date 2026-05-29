"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Image as ImageIcon,
  Film,
  Loader2,
  Send,
  Globe,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCreatePost, useMyGroups } from "@/lib/hooks/useFeed";
import type { Group } from "@/lib/types";

const MAX_FILES = 10;
const MAX_SIZE_MB = 50;

interface FilePreview {
  file: File;
  url: string;
  type: "image" | "video";
}

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, post is pre-assigned to this group */
  defaultGroupId?: string;
}

export function CreatePostModal({
  open,
  onOpenChange,
  defaultGroupId,
}: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [groupId, setGroupId] = useState(defaultGroupId ?? "global");
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { filiereGroup, clubs } = useMyGroups();
  const createPost = useCreatePost(groupId === "global" ? undefined : groupId);

  const allGroups: Group[] = [
    ...(filiereGroup ? [filiereGroup] : []),
    ...clubs,
  ];

  // ── File handling ─────────────────────────────────────────────────────────
  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      const remaining = MAX_FILES - previews.length;
      const toAdd = arr.slice(0, remaining);

      const oversized = toAdd.filter((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
      if (oversized.length) {
        toast.error(
          `Fichiers trop volumineux (max ${MAX_SIZE_MB} MB) : ${oversized.map((f) => f.name).join(", ")}`,
        );
      }

      const valid = toAdd.filter((f) => f.size <= MAX_SIZE_MB * 1024 * 1024);
      if (!valid.length) return;

      const newPreviews: FilePreview[] = valid.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
      }));
      setPreviews((prev) => [...prev, ...newPreviews]);
    },
    [previews.length],
  );

  const removeFile = (index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!content.trim() && previews.length === 0) {
      toast.error("Ajoutez du texte ou un média.");
      return;
    }

    const fd = new FormData();
    if (content.trim()) fd.append("content", content.trim());
    if (groupId !== "global") fd.append("group_id", groupId);
    previews.forEach((p) => fd.append("media[]", p.file));

    createPost.mutate(fd, {
      onSuccess: () => {
        toast.success("Publication créée !");
        handleClose();
      },
      onError: () => toast.error("Erreur lors de la publication. Réessayez."),
    });
  };

  const handleClose = () => {
    if (createPost.isPending) return;
    setContent("");
    setGroupId(defaultGroupId ?? "global");
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
    onOpenChange(false);
  };

  // ── Media grid layout ─────────────────────────────────────────────────────
  const gridClass =
    previews.length === 1
      ? "grid-cols-1"
      : previews.length === 2
        ? "grid-cols-2"
        : "grid-cols-3";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Nouvelle publication</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Group selector */}
          <Select value={groupId} onValueChange={setGroupId}>
            <SelectTrigger>
              <SelectValue placeholder="Audience…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">
                <span className="flex items-center gap-2">
                  <Globe className="size-3.5 text-muted-foreground" />
                  Feed Global (tous les étudiants)
                </span>
              </SelectItem>
              {filiereGroup && (
                <SelectItem value={filiereGroup.id}>
                  <span className="flex items-center gap-2">
                    <Lock className="size-3.5 text-blue-400" />
                    {filiereGroup.name}
                    <Badge className="ml-1 px-1.5 py-0 text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Mon groupe
                    </Badge>
                  </span>
                </SelectItem>
              )}
              {clubs.map((club) => (
                <SelectItem key={club.id} value={club.id}>
                  <span className="flex items-center gap-2">
                    <Lock className="size-3.5 text-purple-400" />
                    {club.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Text area */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Quoi de neuf à l'ENSIAS ?"
            rows={4}
            className="resize-none"
            maxLength={5000}
          />
          {content.length > 4500 && (
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/5000
            </p>
          )}

          {/* Drop zone */}
          {previews.length < MAX_FILES && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 cursor-pointer transition-colors
                ${
                  dragging
                    ? "border-[#B01817] bg-[#B01817]/5"
                    : "border-border hover:border-[#B01817]/60 hover:bg-muted/40"
                }`}
            >
              <Upload className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Glissez-déposez ou{" "}
                <span className="text-[#B01817] font-medium">cliquez</span> pour
                ajouter des photos/vidéos
              </p>
              <p className="text-xs text-muted-foreground">
                {previews.length}/{MAX_FILES} fichiers · max {MAX_SIZE_MB} MB
                chacun
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="sr-only"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </div>
          )}

          {/* Previews grid */}
          <AnimatePresence>
            {previews.length > 0 && (
              <motion.div
                className={`grid gap-2 ${gridClass}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {previews.map((p, i) => (
                  <motion.div
                    key={p.url}
                    className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    {p.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black/60">
                        <Film className="size-8 text-white/70" />
                        <span className="text-xs text-white/70 ml-2 truncate max-w-[80%]">
                          {p.file.name}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                      aria-label="Supprimer"
                    >
                      <X className="size-3.5 text-white" />
                    </button>
                    {p.type === "video" && (
                      <div className="absolute bottom-1 left-1">
                        <Badge className="text-[10px] px-1.5 py-0 bg-black/60 text-white border-0">
                          <Film className="size-2.5 mr-0.5" /> Vidéo
                        </Badge>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="mt-4 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createPost.isPending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              createPost.isPending || (!content.trim() && previews.length === 0)
            }
            className="bg-[#B01817] hover:bg-[#8f1211] text-white gap-2"
          >
            {createPost.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Envoi…
              </>
            ) : (
              <>
                <Send className="size-4" />
                Publier
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
