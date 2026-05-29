'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { useComments, useCreateComment } from '@/lib/hooks/useSocial';
import type { SocialableType } from '@/lib/types/social';

interface CommentSectionProps {
  type: SocialableType;
  id: string | number;
  currentUserId?: string; // UUID
  isModerator?: boolean;
}

export function CommentSection({
  type,
  id,
  currentUserId,
  isModerator = false,
}: CommentSectionProps) {
  const { data, isLoading } = useComments(type, id);
  const createMutation = useCreateComment(type, id);

  const comments = data?.data ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="pt-3 space-y-3">
        {/* New comment input */}
        <CommentInput
          onSubmit={(content) => createMutation.mutate(content)}
          isLoading={createMutation.isPending}
        />

        {/* Comments list */}
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            Aucun commentaire. Soyez le premier !
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                type={type}
                id={id}
                currentUserId={currentUserId}
                isModerator={isModerator}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
