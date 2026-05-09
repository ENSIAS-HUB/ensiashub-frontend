'use client';

import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReactionBarProps {
  reactionsCount: number;
  commentsCount: number;
  userReacted: boolean;
  onReact: () => void;
}

export function ReactionBar({ reactionsCount, commentsCount, userReacted, onReact }: ReactionBarProps) {
  return (
    <div className="flex items-center gap-1 pt-1 border-t border-border/50">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'gap-1.5 text-xs h-8',
          userReacted ? 'text-[#B01817]' : 'text-muted-foreground'
        )}
        onClick={onReact}
      >
        <Heart
          className="size-4"
          fill={userReacted ? '#B01817' : 'none'}
          stroke={userReacted ? '#B01817' : 'currentColor'}
        />
        {reactionsCount > 0 && <span>{reactionsCount}</span>}
      </Button>
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 text-muted-foreground">
        <MessageCircle className="size-4" />
        {commentsCount > 0 && <span>{commentsCount}</span>}
      </Button>
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 text-muted-foreground ml-auto">
        <Share2 className="size-4" />
        Partager
      </Button>
    </div>
  );
}
