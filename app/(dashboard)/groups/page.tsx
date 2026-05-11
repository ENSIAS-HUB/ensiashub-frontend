'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Crown,
  UserCheck,
  Search,
  UserPlus,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/common/EmptyState';
import { AnimatedList } from '@/components/common/AnimatedList';
import { getGroups, joinGroup } from '@/lib/api/groups';
import type { Group, GroupCategory } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  filiere: { label: 'Filière', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  club:    { label: 'Club',    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  general: { label: 'Général', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

// Tracks join-pending groups in component state (optimistic)
function GroupCard({
  group,
  joinPending,
  onJoin,
}: {
  group: Group;
  joinPending: boolean;
  onJoin: (group: Group) => void;
}) {
  const cat = CATEGORY_CONFIG[group.category] ?? CATEGORY_CONFIG.general;
  const initials = group.name.slice(0, 2).toUpperCase();

  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-5 space-y-4 hover:border-[#B01817]/20 transition-colors"
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Cover */}
      <div className="relative h-20 rounded-lg overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
        {group.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={group.cover_image} alt={group.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-white/40">{initials}</span>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className={cn('text-[10px] border', cat.color)}>
            {cat.label}
          </Badge>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm leading-tight">{group.name}</h3>
        {group.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{group.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          {group.moderator && (
            <>
              <Avatar className="size-5">
                <AvatarImage src={group.moderator?.avatar} />
                <AvatarFallback className="text-[8px]">
                  {group.moderator?.name?.slice(0, 2).toUpperCase() ?? '??'}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Crown className="size-2.5 text-amber-400" />
                <span className="truncate max-w-[80px]">{group.moderator?.name}</span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <UserCheck className="size-3" />
          <span>{group.members_count}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link href={`/groups/${group.id}`} className="flex-1">
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs"
          >
            Voir
          </Button>
        </Link>
        {/* Filière groups: user is auto-enrolled — show static "Membre" badge */}
        {group.category === 'filiere' ? (
          <Button
            size="sm"
            className="flex-1 h-8 text-xs gap-1 bg-green-700/20 text-green-400 border border-green-700/30 cursor-default"
            disabled
          >
            <UserCheck className="size-3" />Membre
          </Button>
        ) : group.membership_status === 'approved' ? (
          <Button
            size="sm"
            className="flex-1 h-8 text-xs gap-1 bg-green-700/20 text-green-400 border border-green-700/30 cursor-default"
            disabled
          >
            <UserCheck className="size-3" />Membre
          </Button>
        ) : (
          <Button
            size="sm"
            className={cn(
              'flex-1 h-8 text-xs gap-1',
              joinPending || group.membership_status === 'pending'
                ? 'bg-slate-700 text-slate-300 cursor-default'
                : 'bg-[#B01817] hover:bg-[#8f1211] text-white'
            )}
            disabled={joinPending || group.membership_status === 'pending'}
            onClick={() => !joinPending && group.membership_status !== 'pending' && onJoin(group)}
          >
            {joinPending || group.membership_status === 'pending' ? (
              <><Clock className="size-3" />En attente</>
            ) : (
              <><UserPlus className="size-3" />Rejoindre</>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

type FilterTab = 'all' | GroupCategory;

export default function GroupsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => getGroups(),
  });

  const joinMutation = useMutation({
    mutationFn: (id: string) => joinGroup(id),
    onSuccess: (_, id) => {
      setPendingIds((prev) => new Set(prev).add(id));
      toast.success('Demande envoyée !');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: () => toast.error('Erreur lors de la demande.'),
  });

  const allGroups = useMemo<Group[]>(() => {
    const raw = data?.data;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray((raw as any).data?.data)) return (raw as any).data.data;
    return [] as Group[];
  }, [data]);

  const filtered = useMemo(() => {
    return allGroups.filter((g) => {
      const matchCat = activeTab === 'all' || g.category === activeTab;
      const matchSearch =
        !search ||
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        (g.description ?? '').toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allGroups, activeTab, search]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Users className="size-4 text-[#B01817]" />
          Groupes
        </h2>
        <Button size="sm" className="gap-1.5 bg-[#B01817] hover:bg-[#8f1211] text-white">
          <Plus className="size-3.5" />
          Créer
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un groupe…"
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Filter tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
        <TabsList className="h-8 gap-1">
          <TabsTrigger value="all"     className="text-xs h-7">Tous</TabsTrigger>
          <TabsTrigger value="filiere" className="text-xs h-7">Filières</TabsTrigger>
          <TabsTrigger value="club"    className="text-xs h-7">Clubs</TabsTrigger>
          <TabsTrigger value="general" className="text-xs h-7">Général</TabsTrigger>
        </TabsList>

        {/* All tabs share the same grid — content driven by filtered array */}
        {(['all', 'filiere', 'club', 'general'] as FilterTab[]).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Aucun groupe trouvé"
                description={search ? 'Essayez un autre terme de recherche.' : 'Aucun groupe dans cette catégorie.'}
              />
            ) : (
              <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    joinPending={pendingIds.has(group.id) || joinMutation.isPending}
                    onJoin={(g) => joinMutation.mutate(g.id)}
                  />
                ))}
              </AnimatedList>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
