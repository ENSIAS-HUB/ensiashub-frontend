'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RoleGuard } from '@/components/common/RoleGuard';
import { useAuthStore } from '@/lib/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getComments, createComment } from '@/lib/api/publications';
import type { Publication, Comment } from '@/lib/types';
import { cn } from '@/lib/utils';

const SHOW_LIMIT = 2;

function CommentItem({ comment }: { comment: Comment }) {
  const initials = comment.author.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <motion.div
      className="flex gap-2.5"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Avatar className="size-6 shrink-0 mt-0.5">
        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
        <AvatarFallback className="bg-[#B01817]/20 text-[#B01817] text-[10px] font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="rounded-xl bg-muted px-3 py-2">
          <p className="text-xs font-semibold leading-tight">{comment.author.name}</p>
          <p className="text-xs text-foreground/85 mt-0.5 leading-snug">{comment.content}</p>
        </div>
      </div>
    </motion.div>
  );
}

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
    filiere: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    club: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    general: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return map[category] ?? map.general;
}

export function PostCard({ post, onReact }: PostCardProps) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const isAuthor = currentUser?.id === post.author.id;
  const [reacted, setReacted] = useState(post.user_reacted);
  const [reactCount, setReactCount] = useState(post.reactions_count);
  const [heartBounce, setHeartBounce] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localCount, setLocalCount] = useState(post.comments_count);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleReact = () => {
    setReacted((v) => !v);
    setReactCount((c) => (reacted ? c - 1 : c + 1));
    setHeartBounce(true);
    setTimeout(() => setHeartBounce(false), 400);
    onReact(post.id);
  };

  // Fetch comments only when panel is open
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', post.id],
    queryFn: () => getComments(post.id),
    enabled: showComments,
    staleTime: 30_000,
  });
  const allComments: Comment[] = commentsData?.data?.data ?? [];
  const visibleComments = showAll ? allComments : allComments.slice(0, SHOW_LIMIT);

  const { mutate: submitComment, isPending: isSubmitting } = useMutation({
    mutationFn: (content: string) => createComment(post.id, content),
    onSuccess: () => {
      setCommentText('');
      setLocalCount((c) => c + 1);
      queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
    },
    onError: () => {
      toast.error('Impossible d\'envoyer le commentaire. Réessayez.');
    },
  });

  const handleToggleComments = () => {
    setShowComments((v) => !v);
    if (!showComments) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  };

  const handleSend = () => {
    const text = commentText.trim();
    if (!text) return;
    submitComment(text);
  };

  const initials = post.author.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-5 space-y-4 hover:bg-card/80 hover:shadow-lg hover:shadow-black/20 transition-shadow"
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback className="bg-[#B01817]/20 text-[#B01817] text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold leading-tight">{post.author.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge
                variant="outline"
                className={cn('text-[10px] px-1.5 py-0 h-4 border', getCategoryColor(post.group?.category ?? 'general'))}
              >
                {post.group?.name ?? 'Général'}
              </Badge>
              <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 -mr-1 text-muted-foreground">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Signaler</DropdownMenuItem>
            <DropdownMenuItem>Copier le lien</DropdownMenuItem>
            {isAuthor && (
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash2 className="size-3.5 mr-1.5" />
                Supprimer
              </DropdownMenuItem>
            )}
            <RoleGuard allowedRoles={['chef_scolarite']}>
              {!isAuthor && (
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="size-3.5 mr-1.5" />
                  Supprimer (admin)
                </DropdownMenuItem>
              )}
            </RoleGuard>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Media */}
      {post.media_url && (
        <div className="rounded-lg overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.media_url}
            alt="Media"
            className="w-full object-cover max-h-80"
            loading="lazy"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'gap-1.5 text-xs h-8',
            reacted ? 'text-[#B01817] hover:text-[#B01817]' : 'text-muted-foreground'
          )}
          onClick={handleReact}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={reacted ? 'reacted' : 'not-reacted'}
              className={heartBounce ? 'animate-heart-bounce' : ''}
            >
              <Heart
                className="size-4"
                fill={reacted ? '#B01817' : 'none'}
                stroke={reacted ? '#B01817' : 'currentColor'}
              />
            </motion.div>
          </AnimatePresence>
          {reactCount > 0 && <span>{reactCount}</span>}
        </Button>

        <Button variant="ghost" size="sm"
          className={cn('gap-1.5 text-xs h-8', showComments ? 'text-[#B01817]' : 'text-muted-foreground')}
          onClick={handleToggleComments}
        >
          <MessageCircle className="size-4" />
          {localCount > 0 && <span>{localCount}</span>}
          {showComments ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        </Button>

        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 text-muted-foreground ml-auto">
          <Share2 className="size-4" />
          Partager
        </Button>
      </div>

      {/* Inline comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            key="comments-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="space-y-2.5 pt-1">
              {commentsLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 className="size-3 animate-spin" />
                  Chargement…
                </div>
              ) : allComments.length === 0 ? (
                <p className="text-xs text-muted-foreground py-1">Soyez le premier à commenter.</p>
              ) : (
                <>
                  {visibleComments.map((c) => (
                    <CommentItem key={c.id} comment={c} />
                  ))}
                  {allComments.length > SHOW_LIMIT && (
                    <Button
                      variant="ghost" size="sm"
                      className="h-6 text-xs text-muted-foreground gap-1 px-2"
                      onClick={() => setShowAll((v) => !v)}
                    >
                      {showAll
                        ? 'Réduire'
                        : `Voir les ${allComments.length - SHOW_LIMIT} autres commentaires`}
                    </Button>
                  )}
                </>
              )}

              {/* Comment input */}
              <div className="flex gap-2 items-center pt-1">
                <Avatar className="size-6 shrink-0">
                  <AvatarFallback className="bg-[#B01817]/20 text-[#B01817] text-[10px] font-semibold">
                    {currentUser?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'EH'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 items-center rounded-full border border-border bg-muted px-3 py-1.5 gap-2">
                  <input
                    ref={inputRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Écrire un commentaire…"
                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
                    disabled={isSubmitting}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!commentText.trim() || isSubmitting}
                    className="text-[#B01817] disabled:text-muted-foreground/40 transition-colors"
                    aria-label="Envoyer"
                  >
                    {isSubmitting
                      ? <Loader2 className="size-3.5 animate-spin" />
                      : <Send className="size-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
