"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { PostCard } from "@/components/feed/PostCard";
import { PostSkeleton } from "@/components/feed/PostSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { AnimatedList } from "@/components/common/AnimatedList";
import { CreatePostModal } from "@/components/feed/CreatePostModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGroupFeed } from "@/lib/hooks/useFeed";
import { useQuery } from "@tanstack/react-query";
import { getGroup } from "@/lib/api/groups";

export default function GroupFeedPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);

  const {
    publications,
    isLoading,
    isError,
    refetch,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    react,
  } = useGroupFeed(groupId);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Load group metadata
  const { data: groupData } = useQuery({
    queryKey: ["groups", groupId],
    queryFn: () => getGroup(groupId),
    staleTime: 60_000,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const group = (groupData?.data as any)?.data ?? null;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage)
          fetchNextPage();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const categoryColor: Record<string, string> = {
    filiere: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    club: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    general: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Back + group header */}
      <div className="space-y-3">
        <Link
          href="/feed"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-4" />
          Retour au fil global
        </Link>

        {group && (
          <motion.div
            className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/95 backdrop-blur-sm p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold truncate">{group.name}</h1>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${categoryColor[group.category] ?? categoryColor.general}`}
                  >
                    {group.category === "filiere"
                      ? "Filière"
                      : group.category === "club"
                        ? "Club"
                        : "Général"}
                  </Badge>
                </div>
                {group.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {group.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  <Users className="size-3" />
                  {group.members_count} membre
                  {group.members_count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Users className="size-4" />
          Publications du groupe
        </h2>

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
              <p className="font-semibold">
                Impossible de charger les publications
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Vous devez être membre de ce groupe.
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
            icon={Users}
            title="Aucune publication"
            description="Soyez le premier à publier dans ce groupe !"
          />
        ) : (
          <AnimatedList className="space-y-4">
            {publications.map((post) => (
              <PostCard key={post.id} post={post} onReact={react} />
            ))}
          </AnimatedList>
        )}

        <div ref={sentinelRef} className="h-1" />
        {isFetchingNextPage && <PostSkeleton />}
      </div>

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

      <CreatePostModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultGroupId={groupId}
      />
    </div>
  );
}
