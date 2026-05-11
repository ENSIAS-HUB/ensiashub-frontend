'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Users, Crown, UserPlus, UserCheck, Clock,
  ShieldCheck, CheckCircle2, XCircle, AlertCircle, RefreshCw, Info,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PostCard } from '@/components/feed/PostCard';
import { EmptyState } from '@/components/common/EmptyState';
import {
  getGroup, getGroupMembers, getGroupRequests, joinGroup, validateMember,
} from '@/lib/api/groups';
import { getPublications, reactToPublication } from '@/lib/api/publications';
import { useAuthStore } from '@/lib/store/authStore';
import type { User, Group } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// â”€â”€ Category colours â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CAT_CONFIG: Record<string, { label: string; color: string }> = {
  filiere: { label: 'FiliÃ¨re', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  club:    { label: 'Club',    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  general: { label: 'GÃ©nÃ©ral', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

// â”€â”€ Group header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function GroupHeader({
  group,
  isMember,
  isPending,
  onJoin,
  joinLoading,
}: {
  group: Group;
  isMember: boolean;
  isPending: boolean;
  onJoin: () => void;
  joinLoading: boolean;
}) {
  const cat = CAT_CONFIG[group.category] ?? CAT_CONFIG.general;
  const initials = group.name.slice(0, 2).toUpperCase();
  const modInitials = group.moderator?.name?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      {/* Cover */}
      <div className="relative h-32 bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
        {group.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={group.cover_image} alt={group.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl font-bold text-white/20 select-none">{initials}</span>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={cn('text-[10px] border', cat.color)}>
            {cat.label}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <h1 className="text-base font-bold leading-tight">{group.name}</h1>
          {group.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
            <div className="flex items-center gap-1.5">
              <Avatar className="size-4">
                <AvatarImage src={group.moderator?.avatar} />
                <AvatarFallback className="text-[8px]">{modInitials}</AvatarFallback>
              </Avatar>
              <Crown className="size-2.5 text-amber-400" />
              <span>{group.moderator?.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="size-3" />
              <span>{group.members_count} membres</span>
            </div>
          </div>
        </div>

        {/* Join/status button */}
        {isMember ? (
          <Badge className="shrink-0 bg-green-500/15 text-green-400 border-green-500/30 border gap-1 px-2.5">
            <UserCheck className="size-3" /> Membre
          </Badge>
        ) : isPending ? (
          <Badge className="shrink-0 bg-slate-700 text-slate-300 border-0 gap-1 px-2.5">
            <Clock className="size-3" /> En attente
          </Badge>
        ) : (
          <Button
            size="sm"
            disabled={joinLoading}
            onClick={onJoin}
            className="shrink-0 gap-1.5 bg-[#B01817] hover:bg-[#8f1211] text-white h-8 text-xs"
          >
            <UserPlus className="size-3.5" />
            Rejoindre
          </Button>
        )}
      </div>
    </div>
  );
}

// â”€â”€ Member row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MemberRow({ member, index }: { member: User; index: number }) {
  return (
    <motion.div
      className="flex items-center gap-3 rounded-lg p-3 bg-card border border-border"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Avatar className="size-8">
        <AvatarImage src={member.avatar} />
        <AvatarFallback className="text-xs bg-[#B01817]/20 text-[#B01817]">
          {member.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{member.name}</p>
        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
      </div>
      {member.role !== 'etudiant' && (
        <Crown className="size-3.5 text-amber-400 shrink-0" />
      )}
    </motion.div>
  );
}

// â”€â”€ Request row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function RequestRow({
  member,
  index,
  onValidate,
  isLoading,
}: {
  member: User;
  index: number;
  onValidate: (userId: string, action: 'approve' | 'reject') => void;
  isLoading: boolean;
}) {
  return (
    <motion.div
      className="flex items-center gap-3 rounded-lg p-3 bg-card border border-border"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Avatar className="size-8">
        <AvatarImage src={member.avatar} />
        <AvatarFallback className="text-xs bg-slate-700 text-slate-300">
          {member.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{member.name}</p>
        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          size="sm" variant="outline" disabled={isLoading}
          onClick={() => onValidate(member.id, 'approve')}
          className="h-7 text-xs gap-1 border-green-500/40 text-green-400 hover:bg-green-500/10"
        >
          <CheckCircle2 className="size-3.5" /> Accepter
        </Button>
        <Button
          size="sm" variant="outline" disabled={isLoading}
          onClick={() => onValidate(member.id, 'reject')}
          className="h-7 text-xs gap-1 border-destructive/40 text-destructive hover:bg-destructive/10"
        >
          <XCircle className="size-3.5" /> Refuser
        </Button>
      </div>
    </motion.div>
  );
}

// â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const isModerator =
    currentUser?.role === 'delegue' ||
    currentUser?.role === 'chef_scolarite' ||
    currentUser?.role === 'president_club';

  // â”€â”€ Queries â”€â”€
  const { data: groupData, isLoading: groupLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: () => getGroup(id),
    enabled: !!id,
  });

  const { data: membersData, isLoading: membersLoading, isError: membersError, refetch: refetchMembers } = useQuery({
    queryKey: ['group-members', id],
    queryFn: () => getGroupMembers(id),
    enabled: !!id,
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['group-requests', id],
    queryFn: () => getGroupRequests(id),
    enabled: !!id && isModerator,
  });

  const { data: pubsData, isLoading: pubsLoading } = useQuery({
    queryKey: ['publications', { group_id: id }],
    queryFn: () => getPublications(1, id),
    enabled: !!id,
  });

  // â”€â”€ Mutations â”€â”€
  const joinMutation = useMutation({
    mutationFn: () => joinGroup(id),
    onSuccess: () => {
      toast.success('Demande envoyÃ©e !');
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      queryClient.invalidateQueries({ queryKey: ['group-members', id] });
    },
    onError: () => toast.error('Erreur lors de la demande.'),
  });

  const validateMutation = useMutation({
    mutationFn: ({ userId }: { userId: string; action: 'approve' | 'reject' }) =>
      validateMember(id, userId),
    onSuccess: (_, { action }) => {
      toast.success(action === 'approve' ? 'Membre acceptÃ© !' : 'Demande refusÃ©e.');
      queryClient.invalidateQueries({ queryKey: ['group-members', id] });
      queryClient.invalidateQueries({ queryKey: ['group-requests', id] });
      queryClient.invalidateQueries({ queryKey: ['group', id] });
    },
    onError: () => toast.error('Erreur lors de la validation.'),
  });

  const reactMutation = useMutation({
    mutationFn: (pubId: string) => reactToPublication(pubId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['publications', { group_id: id }] }),
  });

  const group   = groupData?.data.data;
  const members = membersData?.data.data ?? [];
  const requests = requestsData?.data.data ?? [];
  const pubs    = pubsData?.data?.data ?? [];

  const isMember  = members.some((m) => m.id === currentUser?.id);
  const isPending = false; // determined by optimistic state after join

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
      {/* Back */}
      <Link href="/groups">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-1 text-muted-foreground h-8 text-xs">
          <ArrowLeft className="size-3.5" />
          Tous les groupes
        </Button>
      </Link>

      {/* Group header */}
      {groupLoading ? (
        <div className="rounded-xl border border-border overflow-hidden">
          <Skeleton className="h-32 w-full rounded-none" />
          <div className="px-5 py-4 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-72" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ) : group ? (
        <GroupHeader
          group={group}
          isMember={isMember}
          isPending={isPending}
          onJoin={() => joinMutation.mutate()}
          joinLoading={joinMutation.isPending}
        />
      ) : null}

      {/* Tabs */}
      <Tabs defaultValue="publications">
        <TabsList className="h-8 gap-0.5">
          <TabsTrigger value="publications" className="text-xs h-7">Publications</TabsTrigger>
          <TabsTrigger value="members" className="text-xs h-7 gap-1.5">
            <Users className="size-3" />
            Membres ({members.length})
          </TabsTrigger>
          {isModerator && (
            <TabsTrigger value="moderation" className="text-xs h-7 gap-1.5">
              <ShieldCheck className="size-3" />
              ModÃ©ration
              {requests.length > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-[#B01817] text-[10px] text-white font-bold">
                  {requests.length}
                </span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="about" className="text-xs h-7 gap-1.5">
            <Info className="size-3" />
            Ã€ propos
          </TabsTrigger>
        </TabsList>

        {/* Publications */}
        <TabsContent value="publications" className="mt-4 space-y-4">
          {pubsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
          ) : pubs.length === 0 ? (
            <EmptyState variant="feed" icon={undefined} title="Aucune publication dans ce groupe." />
          ) : (
            pubs.map((post) => (
              <PostCard key={post.id} post={post} onReact={(pid) => reactMutation.mutate(pid)} />
            ))
          )}
        </TabsContent>

        {/* Members */}
        <TabsContent value="members" className="mt-4">
          {membersLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : membersError ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <AlertCircle className="size-8 text-destructive" />
              <p className="text-sm text-muted-foreground">Impossible de charger les membres.</p>
              <Button variant="outline" size="sm" onClick={() => refetchMembers()} className="gap-2">
                <RefreshCw className="size-4" /> RÃ©essayer
              </Button>
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun membre.</p>
          ) : (
            <div className="space-y-2">
              {members.map((m, i) => <MemberRow key={m.id} member={m} index={i} />)}
            </div>
          )}
        </TabsContent>

        {/* Moderation */}
        {isModerator && (
          <TabsContent value="moderation" className="mt-4 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#B01817]" />
              Demandes d'adhÃ©sion
            </h3>
            {requestsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-3.5 flex-1" />
                    <Skeleton className="h-7 w-20" />
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <CheckCircle2 className="size-8 text-green-400" />
                <p className="text-sm text-muted-foreground">Aucune demande en attente.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {requests.map((req, i) => (
                  <RequestRow
                    key={req.id}
                    member={req}
                    index={i}
                    isLoading={validateMutation.isPending}
                    onValidate={(userId, action) => validateMutation.mutate({ userId, action })}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* About */}
        <TabsContent value="about" className="mt-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            {groupLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ) : group ? (
              <>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {group.description ?? 'Aucune description disponible.'}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm pt-2 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">CatÃ©gorie</p>
                    <Badge variant="outline" className={cn('mt-1 text-[10px] border', CAT_CONFIG[group.category]?.color)}>
                      {CAT_CONFIG[group.category]?.label ?? group.category}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Membres</p>
                    <p className="font-semibold">{group.members_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ModÃ©rateur</p>
                    <p className="font-semibold truncate max-w-[120px]">{group.moderator?.name}</p>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
