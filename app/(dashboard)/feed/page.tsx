'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Plus, AlertCircle, RefreshCw, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { PostCard } from '@/components/feed/PostCard';
import { PostSkeleton } from '@/components/feed/PostSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { AnimatedList } from '@/components/common/AnimatedList';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFeed } from '@/lib/hooks/useFeed';
import { getGroups } from '@/lib/api/groups';

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
    createPost,
    isCreating,
  } = useFeed();

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [content, setContent] = useState('');
  const [groupId, setGroupId] = useState('');

  // Load groups for the selector
  const { data: groupsData } = useQuery({
    queryKey: ['groups'],
    queryFn: () => getGroups(),
    staleTime: 60_000,
  });
  const groups = useMemo(() => {
    // Defensive: GroupController returns raw paginator {current_page, data:[...]}
    // so groupsData.data.data = the array
    const raw = groupsData?.data;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.data?.data)) return raw.data.data;
    return [];
  }, [groupsData]);

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

  const handleCreate = () => {
    if (!content.trim()) {
      toast.error('Le contenu ne peut pas être vide.');
      return;
    }
    if (!groupId) {
      toast.error('Sélectionnez un groupe.');
      return;
    }
    createPost(
      { content: content.trim(), group_id: groupId },
      {
        onSuccess: () => {
          toast.success('Publication créée !');
          setContent('');
          setGroupId('');
          setDialogOpen(false);
        },
        onError: () => {
          toast.error('Erreur lors de la création. Réessayez.');
        },
      }
    );
  };

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
        ) : isError ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
            <AlertCircle className="size-10 text-destructive" />
            <div>
              <p className="font-semibold">Impossible de charger le fil</p>
              <p className="text-sm text-muted-foreground mt-1">Vérifiez votre connexion ou réessayez.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="size-4" />
              Réessayer
            </Button>
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

      {/* Right sidebar */}
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

      {/* FAB — Create post */}
      <motion.button
        onClick={() => setDialogOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#B01817] text-white shadow-lg shadow-[#B01817]/40 hover:bg-[#8f1211] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B01817] focus-visible:ring-offset-2"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        aria-label="Créer une publication"
      >
        <Plus className="size-6" />
      </motion.button>

      {/* Create post dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle publication</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Group selector */}
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un groupe…" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Content textarea */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Quoi de neuf à l'ENSIAS ?"
              rows={5}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isCreating}>
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !content.trim() || !groupId}
              className="bg-[#B01817] hover:bg-[#8f1211] text-white gap-2"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
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
    </div>
  );
}
