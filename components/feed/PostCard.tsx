'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Publication } from '@/lib/types';
import { cn } from '@/lib/utils';

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
  const [reacted, setReacted] = useState(post.user_reacted);
  const [reactCount, setReactCount] = useState(post.reactions_count);
  const [heartBounce, setHeartBounce] = useState(false);

  const handleReact = () => {
    setReacted((v) => !v);
    setReactCount((c) => (reacted ? c - 1 : c + 1));
    setHeartBounce(true);
    setTimeout(() => setHeartBounce(false), 400);
    onReact(post.id);
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
                className={cn('text-[10px] px-1.5 py-0 h-4 border', getCategoryColor(post.group.category))}
              >
                {post.group.name}
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

        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 text-muted-foreground">
          <MessageCircle className="size-4" />
          {post.comments_count > 0 && <span>{post.comments_count}</span>}
        </Button>

        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 text-muted-foreground ml-auto">
          <Share2 className="size-4" />
          Partager
        </Button>
      </div>
    </motion.div>
  );
}
