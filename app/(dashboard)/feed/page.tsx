'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Users } from 'lucide-react';
import { PostCard } from '@/components/feed/PostCard';
import { PostSkeleton } from '@/components/feed/PostSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { AnimatedList } from '@/components/common/AnimatedList';
import { useFeed } from '@/lib/hooks/useFeed';

export default function FeedPage() {
  const { publications, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, react } = useFeed();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      {/* Feed column */}
      <div className="space-y-4 min-w-0">
        <motion.h2
          className="text-base font-semibold flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Zap className="size-4 text-[#B01817]" />
          Fil d'actualité
        </motion.h2>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}
          </div>
        ) : publications.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="Aucune publication"
            description="Rejoignez des groupes pour voir leurs publications ici."
          />
        ) : (
          <AnimatedList className="space-y-4">
            {publications.map((post) => (
              <PostCard key={post.id} post={post} onReact={react} />
            ))}
          </AnimatedList>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-1" />

        {isFetchingNextPage && (
          <div className="space-y-4">
            <PostSkeleton />
          </div>
        )}
      </div>

      {/* Right sidebar — sticky */}
      <aside className="hidden lg:block space-y-4">
        <div className="sticky top-20 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Users className="size-4 text-muted-foreground" />
              Groupes rejoints
            </h3>
            <p className="text-xs text-muted-foreground">Chargement…</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Suggestions</h3>
            <p className="text-xs text-muted-foreground">Aucune suggestion pour l'instant.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
