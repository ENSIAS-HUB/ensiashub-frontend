'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Reply, Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CommentInput } from './CommentInput';
import type { SocialComment, SocialableType } from '@/lib/types/social';
import {
  useReplyComment,
  useDeleteComment,
  useEditComment,
} from '@/lib/hooks/useSocial';

interface CommentItemProps {
  comment: SocialComment;
  type: SocialableType;
  id: string | number;
  currentUserId?: string; // UUID
  isModerator?: boolean;
  depth?: number;
}

export function CommentItem({
  comment,
  type,
  id,
  currentUserId,
  isModerator = false,
  depth = 0,
}: CommentItemProps) {
  const [showReply, setShowReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const replyMutation = useReplyComment(type, id);
  const deleteMutation = useDeleteComment(type, id);
  const editMutation = useEditComment(type, id);

  const isOwner = currentUserId === comment.user?.id;
  const canDelete = isOwner || isModerator;
  const isDeleted = comment.content === '[Ce commentaire a été supprimé]';

  const displayName = `${comment.user?.prenom ?? ''} ${comment.user?.nom ?? ''}`.trim();

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: fr,
  });

  const handleReply = (content: string) => {
    replyMutation.mutate(
      { commentId: comment.id, content },
      { onSuccess: () => setShowReply(false) }
    );
  };

  const handleEdit = (content: string) => {
    editMutation.mutate(
      { commentId: comment.id, content },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  return (
    <div className={cn('flex gap-2.5', depth > 0 && 'ml-8 border-l border-border/40 pl-3')}>
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        {comment.user?.avatar_url ?? comment.user?.photoProfil ? (
          <Image
            src={(comment.user.avatar_url ?? comment.user.photoProfil)!}
            alt={displayName}
            width={28}
            height={28}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="size-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-xl px-3 py-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-foreground">{displayName}</span>
            <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
          </div>

          {isEditing ? (
            <CommentInput
              placeholder="Modifier le commentaire…"
              onSubmit={handleEdit}
              isLoading={editMutation.isPending}
              autoFocus
              compact
            />
          ) : (
            <p
              className={cn(
                'text-sm mt-0.5 leading-relaxed',
                isDeleted && 'italic text-muted-foreground'
              )}
            >
              {comment.content}
            </p>
          )}
        </div>

        {/* Actions */}
        {!isDeleted && (
          <div className="flex items-center gap-1 mt-0.5 ml-1">
            {depth === 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] text-muted-foreground gap-1"
                onClick={() => setShowReply((v) => !v)}
              >
                <Reply className="size-3" />
                Répondre
              </Button>
            )}
            {isOwner && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] text-muted-foreground gap-1"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="size-3" />
                Modifier
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] text-destructive/70 hover:text-destructive gap-1"
                onClick={() => deleteMutation.mutate(comment.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="size-3" />
                Supprimer
              </Button>
            )}
          </div>
        )}

        {/* Reply input */}
        {showReply && (
          <div className="mt-2 ml-1">
            <CommentInput
              placeholder="Votre réponse…"
              onSubmit={handleReply}
              isLoading={replyMutation.isPending}
              autoFocus
              compact
            />
          </div>
        )}

        {/* Nested replies */}
        {comment.replies_count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-muted-foreground mt-1 ml-1 gap-1"
            onClick={() => setShowReplies((v) => !v)}
          >
            {showReplies ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
            {comment.replies_count} réponse{comment.replies_count > 1 ? 's' : ''}
          </Button>
        )}

        {showReplies && comment.replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            type={type}
            id={id}
            currentUserId={currentUserId}
            isModerator={isModerator}
            depth={depth + 1}
          />
        ))}
      </div>
    </div>
  );
}
