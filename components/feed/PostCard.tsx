"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  Film,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api/client";
import type { Publication, PostMedia } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ThreeDotsMenu } from "@/components/social/ThreeDotsMenu";
import { CommentSection } from "@/components/social/CommentSection";
import { ShareModal } from "@/components/social/ShareModal";
import { SaveButton } from "@/components/social/SaveButton";

// ── URL resolver (backend-relative paths → absolute) ────────────────────────
const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.ensiashub.me/api"
).replace(/\/api$/, "");
function resolveUrl(url: string): string {
  if (!url || url.startsWith("http")) return url;
  return `${BACKEND_URL}${url}`;
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
  media,
  initialIndex,
  onClose,
}: {
  media: PostMedia[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const current = media[index];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-white/10 p-2 hover:bg-white/20 text-white"
        >
          <X className="size-5" />
        </button>

        {media.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIndex((i) => (i - 1 + media.length) % media.length);
              }}
              className="absolute left-4 rounded-full bg-white/10 p-2 hover:bg-white/20 text-white text-xl font-bold"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIndex((i) => (i + 1) % media.length);
              }}
              className="absolute right-4 rounded-full bg-white/10 p-2 hover:bg-white/20 text-white text-xl font-bold"
            >
              ›
            </button>
          </>
        )}

        <motion.div
          key={index}
          onClick={(e) => e.stopPropagation()}
          className="max-w-4xl max-h-[90vh] w-full flex items-center justify-center px-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {current.type === "video" ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={resolveUrl(current.url)}
              controls
              autoPlay
              className="max-h-[80vh] max-w-full rounded-lg"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveUrl(current.url)}
              alt=""
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
            />
          )}
        </motion.div>

        {media.length > 1 && (
          <div className="absolute bottom-4 flex gap-1.5">
            {media.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`size-2 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Media gallery ─────────────────────────────────────────────────────────────
const _itemClass =
  "relative rounded-lg overflow-hidden bg-muted cursor-pointer group";
const _imgClass =
  "w-full h-full object-cover transition-transform duration-200 group-hover:scale-105";
const _overlay =
  "absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity";

function Tile({
  item,
  index,
  className,
  imgClass,
  onOpen,
}: {
  item: PostMedia;
  index: number;
  className?: string;
  imgClass?: string;
  onOpen: (index: number) => void;
}) {
  return (
    <div className={cn(_itemClass, className)} onClick={() => onOpen(index)}>
      {item.type === "video" ? (
        <div className="w-full h-full bg-black flex items-center justify-center">
          <Film className="size-8 text-white/50" />
          <Play className="absolute size-12 text-white/80" />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolveUrl(item.url)}
          alt=""
          className={imgClass ?? _imgClass}
          loading="lazy"
        />
      )}
      <div className={_overlay} />
    </div>
  );
}

function MediaGallery({ media }: { media: PostMedia[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (media.length === 0) return null;

  const open = (i: number) => setLightboxIndex(i);

  // Layout patterns
  if (media.length === 1) {
    return (
      <>
        <div className="rounded-lg overflow-hidden border border-border">
          {media[0].type === "video" ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={resolveUrl(media[0].url)}
              controls
              preload="metadata"
              className="w-full object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveUrl(media[0].url)}
              alt=""
              className="w-full object-contain h-auto cursor-pointer"
              onClick={() => open(0)}
              loading="lazy"
            />
          )}
        </div>
        {lightboxIndex !== null && (
          <Lightbox
            media={media}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </>
    );
  }

  if (media.length === 2) {
    return (
      <>
        <div className="grid grid-cols-2 gap-1">
          <Tile
            item={media[0]}
            index={0}
            onOpen={open}
            imgClass="w-full h-auto object-contain"
          />
          <Tile
            item={media[1]}
            index={1}
            onOpen={open}
            imgClass="w-full h-auto object-contain"
          />
        </div>
        {lightboxIndex !== null && (
          <Lightbox
            media={media}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </>
    );
  }

  if (media.length === 3) {
    return (
      <>
        <div className="grid grid-cols-2 gap-1 h-64">
          <Tile
            item={media[0]}
            index={0}
            className="row-span-2 h-full"
            onOpen={open}
          />
          <Tile item={media[1]} index={1} className="h-full" onOpen={open} />
          <Tile item={media[2]} index={2} className="h-full" onOpen={open} />
        </div>
        {lightboxIndex !== null && (
          <Lightbox
            media={media}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </>
    );
  }

  // 4+
  const visible = media.slice(0, 4);
  const extra = media.length - 4;
  return (
    <>
      <div className="grid grid-cols-2 gap-1 h-64">
        {visible.map((item, i) => (
          <div key={item.id} className={cn(_itemClass)} onClick={() => open(i)}>
            {item.type === "video" ? (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <Film className="size-6 text-white/50" />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveUrl(item.url)}
                alt=""
                className={_imgClass}
                loading="lazy"
              />
            )}
            {i === 3 && extra > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-xl font-bold">+{extra}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {lightboxIndex !== null && (
        <Lightbox
          media={media}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: Publication;
  onReact: (id: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

function getCategoryColor(category: string) {
  const map: Record<string, string> = {
    filiere: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    club: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    general: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
  return map[category] ?? map.general;
}

export function PostCard({ post, onReact }: PostCardProps) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const isAuthor = currentUser?.id === post.author?.id;
  const [reacted, setReacted] = useState(post.user_reacted);
  const [reactCount, setReactCount] = useState(post.reactions_count);
  const [heartBounce, setHeartBounce] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(post.is_saved ?? false);

  const handleReact = () => {
    setReacted((v) => !v);
    setReactCount((c) => (reacted ? c - 1 : c + 1));
    setHeartBounce(true);
    setTimeout(() => setHeartBounce(false), 400);
    onReact(post.id);
  };

  const handleToggleComments = () => setShowComments((v) => !v);

  const handleDelete = async () => {
    if (!confirm("Supprimer cette publication ?")) return;
    try {
      await apiClient.delete(`/publications/${post.id}`);
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Publication supprimée");
    } catch {
      toast.error("Impossible de supprimer la publication");
    }
  };

  const initials =
    (post.author?.name ?? "")
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  // For group posts (clubs and filière-option groups like INSEC/EITC), show
  // the group identity (name + avatar) instead of the technical author
  // (often "Système Admin" for imported/auto-posted content).
  const isGroupPost = !!post.group;
  const displayName = isGroupPost
    ? (post.group?.name ?? "Groupe")
    : (post.author?.name ?? "Utilisateur");
  const displayAvatar = isGroupPost
    ? (post.group?.avatar_url ?? undefined)
    : post.author?.avatar;
  const displayInitials = isGroupPost
    ? (post.group?.name ?? "")
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase() || "?"
    : initials;
  const resolvedAvatar = displayAvatar
    ? isGroupPost
      ? displayAvatar // group avatars live in Next.js /public (e.g. /groups/clubs/*.jpg)
      : resolveUrl(displayAvatar)
    : undefined;

  // Normalise media: use post.media array if available, fall back to legacy media_url
  const mediaItems: PostMedia[] =
    Array.isArray(post.media) && post.media.length > 0
      ? post.media
      : post.media_url
        ? [
            {
              id: "legacy",
              url: post.media_url,
              type: "image",
              thumbnail_url: null,
              order: 0,
            },
          ]
        : [];

  return (
    <motion.div
      className="rounded-2xl border dark:border-white/[0.07] border-black/[0.06] dark:bg-[#0d1117]/95 bg-white/90 backdrop-blur-sm p-5 space-y-4 dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:hover:border-white/[0.12] hover:border-black/[0.12] dark:hover:shadow-[0_4px_32px_rgba(0,0,0,0.5)] hover:shadow-[0_4px_32px_rgba(0,0,0,0.12)] transition-all duration-300"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={resolvedAvatar} alt={displayName} />
            <AvatarFallback className="bg-[#B01817]/20 text-[#B01817] text-xs font-semibold">
              {displayInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold leading-tight">{displayName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {!isGroupPost && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0 h-4 border",
                    getCategoryColor(post.group?.category ?? "general"),
                  )}
                >
                  {post.group?.name ?? "Général"}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {timeAgo(post.created_at)}
              </span>
            </div>
          </div>
        </div>

        <ThreeDotsMenu
          type="publications"
          id={post.id}
          isSaved={isSaved}
          canDelete={
            isAuthor ||
            !!(
              currentUser?.roles?.includes("chef_scolarite") ||
              currentUser?.roles?.includes("admin") ||
              currentUser?.roles?.includes("superAdmin")
            )
          }
          onDelete={handleDelete}
        />
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Instagram import badge */}
      {post.source === "instagram_import" && (
        <div className="flex items-center gap-1.5 text-xs text-pink-400 -mt-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          <span>Importé depuis Instagram</span>
          {post.instagram_url && (
            <a
              href={post.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-pink-300 transition-colors"
            >
              Voir l&apos;original
            </a>
          )}
        </div>
      )}

      {/* Media gallery */}
      {mediaItems.length > 0 && <MediaGallery media={mediaItems} />}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1.5 text-xs h-8",
            reacted
              ? "text-[#B01817] hover:text-[#B01817]"
              : "text-muted-foreground",
          )}
          onClick={handleReact}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={reacted ? "reacted" : "not-reacted"}
              className={heartBounce ? "animate-heart-bounce" : ""}
            >
              <Heart
                className="size-4"
                fill={reacted ? "#B01817" : "none"}
                stroke={reacted ? "#B01817" : "currentColor"}
              />
            </motion.div>
          </AnimatePresence>
          {reactCount > 0 && <span>{reactCount}</span>}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1.5 text-xs h-8",
            showComments ? "text-[#B01817]" : "text-muted-foreground",
          )}
          onClick={handleToggleComments}
        >
          <MessageCircle className="size-4" />
          {post.comments_count > 0 && <span>{post.comments_count}</span>}
          {showComments ? (
            <ChevronUp className="size-3" />
          ) : (
            <ChevronDown className="size-3" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs h-8 text-muted-foreground ml-auto"
          onClick={() => setShareOpen(true)}
        >
          <Share2 className="size-4" />
          Partager
        </Button>

        <SaveButton
          type="publications"
          id={post.id}
          isSaved={isSaved}
          onToggle={setIsSaved}
        />
      </div>

      {/* Inline comments section (polymorphic) */}
      <AnimatePresence>
        {showComments && (
          <CommentSection
            type="publications"
            id={post.id}
            currentUserId={currentUser?.id}
            isModerator={
              !!(
                currentUser?.roles?.includes("chef_scolarite") ||
                currentUser?.roles?.includes("admin") ||
                currentUser?.roles?.includes("superAdmin")
              )
            }
          />
        )}
      </AnimatePresence>

      {/* Share modal */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        type="publications"
        id={post.id}
      />
    </motion.div>
  );
}
