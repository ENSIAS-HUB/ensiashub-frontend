'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Plus, Crown, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { AnimatedList } from '@/components/common/AnimatedList';
import { getGroups } from '@/lib/api/groups';
import type { Group } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  filiere: { label: 'Filière', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  club:    { label: 'Club',    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  general: { label: 'Général', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

function GroupCard({ group }: { group: Group }) {
  const cat = CATEGORY_CONFIG[group.category] ?? CATEGORY_CONFIG.general;
  const initials = group.name.slice(0, 2).toUpperCase();

  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-5 space-y-4 hover:border-[#B01817]/20 transition-colors"
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Cover / icon */}
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
          <Avatar className="size-5">
            <AvatarImage src={group.moderator.avatar} />
            <AvatarFallback className="text-[8px]">
              {group.moderator.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <Crown className="size-2.5 text-amber-400" />
            <span className="truncate max-w-[80px]">{group.moderator.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <UserCheck className="size-3" />
          <span>{group.members_count}</span>
        </div>
      </div>

      <Link href={`/groups/${group.id}`}>
        <Button size="sm" className="w-full h-8 bg-[#B01817] hover:bg-[#D42B2A] text-white text-xs">
          Voir le groupe
        </Button>
      </Link>
    </motion.div>
  );
}

export default function GroupsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => getGroups(),
  });

  const groups = data?.data.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Users className="size-4 text-[#B01817]" />
          Groupes
        </h2>
        <Button size="sm" className="gap-1.5 bg-[#B01817] hover:bg-[#D42B2A] text-white">
          <Plus className="size-3.5" />
          Créer un groupe
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState icon={Users} title="Aucun groupe" description="Créez ou rejoignez un groupe." />
      ) : (
        <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => <GroupCard key={group.id} group={group} />)}
        </AnimatedList>
      )}
    </div>
  );
}
