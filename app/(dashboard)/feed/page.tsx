"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { PostSkeleton } from "@/components/feed/PostSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { AnimatedList } from "@/components/common/AnimatedList";
import { FeedSidebar } from "@/components/feed/FeedSidebar";
import { CreatePostModal } from "@/components/feed/CreatePostModal";
import { Button } from "@/components/ui/button";
import { useGlobalFeed } from "@/lib/hooks/useFeed";

export default function FeedPage() {
  const {
    publications,
    isLoading,
    isError,
    refetch,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    react,
  } = useGlobalFeed();

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
      { rootMargin: "200px" },
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
          Fil d&apos;actualité
        </motion.h2>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
            <AlertCircle className="size-10 text-destructive" />
            <div>
              <p className="font-semibold">Impossible de charger le fil</p>
              <p className="text-sm text-muted-foreground mt-1">
                Vérifiez votre connexion ou réessayez.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="size-4" />
              Réessayer
            </Button>
          </div>
        ) : publications.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="Aucune publication"
            description="Soyez le premier à publier quelque chose !"
          />
        ) : (
          <AnimatedList className="space-y-4">
            {publications.map((post) => (
              <PostCard key={post.id} post={post} onReact={react} />
            ))}
          </AnimatedList>
        )}

        <div ref={sentinelRef} className="h-1" />

        {isFetchingNextPage && (
          <div className="space-y-4">
            <PostSkeleton />
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <FeedSidebar />
        </div>
      </aside>

      {/* FAB */}
      <motion.button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#B01817] text-white shadow-lg shadow-[#B01817]/40 hover:bg-[#8f1211] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B01817] focus-visible:ring-offset-2"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        aria-label="Créer une publication"
      >
        <Plus className="size-6" />
      </motion.button>

      <CreatePostModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
