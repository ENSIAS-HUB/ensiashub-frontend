"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Crown,
  UserPlus,
  UserCheck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Info,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PostCard } from "@/components/feed/PostCard";
import { EmptyState } from "@/components/common/EmptyState";
import {
  getGroup,
  getGroupMembers,
  getGroupRequests,
  joinGroup,
  approveMember,
  rejectMember,
} from "@/lib/api/groups";
import { getPublications, reactToPublication } from "@/lib/api/publications";
import { useAuthStore } from "@/lib/store/authStore";
import type { User, Group } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// â”€â”€ Category colours â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CAT_CONFIG: Record<string, { label: string; color: string }> = {
  filiere: {
    label: "Filière",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  club: {
    label: "Club",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  general: {
    label: "Général",
    color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  },
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
  const modInitials = group.moderator?.name?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      {/* Bannière */}
      <div className="relative h-48 bg-gradient-to-br from-[#1e2a3a] to-[#0f1923]">
        {group.cover_url && (
          <img
            src={group.cover_url}
            alt="Bannière"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        )}
        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className={cn("text-[10px] border", cat.color)}
          >
            {cat.label}
          </Badge>
        </div>
      </div>

      {/* Avatar à cheval sur la bannière */}
      <div className="relative -mt-12 px-5 flex items-end gap-4 pb-4">
        <div className="w-24 h-24 rounded-full border-4 border-card overflow-hidden bg-[#1e2a3a] shrink-0 shadow-lg">
          {group.avatar_url ? (
            <img
              src={group.avatar_url}
              alt={group.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <span className="text-3xl font-bold text-white/40">
                {initials}
              </span>
            </div>
          )}
        </div>

        {/* Infos + actions */}
        <div className="flex-1 min-w-0 pt-14 flex items-end justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <h1 className="text-lg font-bold leading-tight truncate">
              {group.name}
            </h1>
            {group.instagram_handle && (
              <a
                href={group.instagram_url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-pink-400 text-xs hover:text-pink-300 transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                @{group.instagram_handle}
              </a>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
              {group.moderator && (
                <div className="flex items-center gap-1.5">
                  <Avatar className="size-4">
                    <AvatarImage src={group.moderator.avatar} />
                    <AvatarFallback className="text-[8px]">
                      {modInitials}
                    </AvatarFallback>
                  </Avatar>
                  <Crown className="size-2.5 text-amber-400" />
                  <span>{group.moderator.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="size-3" />
                <span>{group.members_count} membres</span>
              </div>
            </div>
            {group.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {group.description}
              </p>
            )}
          </div>

          {/* Join / status button */}
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
      transition={{
        delay: index * 0.04,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
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
      {member.role !== "etudiant" && (
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
  onValidate: (userId: string, action: "approve" | "reject") => void;
  isLoading: boolean;
}) {
  return (
    <motion.div
      className="flex items-center gap-3 rounded-lg p-3 bg-card border border-border"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.04,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
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
          size="sm"
          variant="outline"
          disabled={isLoading}
          onClick={() => onValidate(member.id, "approve")}
          className="h-7 text-xs gap-1 border-green-500/40 text-green-400 hover:bg-green-500/10"
        >
          <CheckCircle2 className="size-3.5" /> Accepter
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isLoading}
          onClick={() => onValidate(member.id, "reject")}
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

  // ── Queries ──
  const { data: groupData, isLoading: groupLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroup(id),
    enabled: !!id,
  });

  const group = groupData?.data.data;

  // Moderator: superAdmin, or the group's own moderator
  const isModerator =
    currentUser?.role === "superAdmin" ||
    (!!group?.moderator && group.moderator.id === currentUser?.id);

  const {
    data: membersData,
    isLoading: membersLoading,
    isError: membersError,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: ["group-members", id],
    queryFn: () => getGroupMembers(id),
    enabled: !!id,
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["group-requests", id],
    queryFn: () => getGroupRequests(id),
    enabled: !!id && isModerator,
  });

  const { data: pubsData, isLoading: pubsLoading } = useQuery({
    queryKey: ["publications", { group_id: id }],
    queryFn: () => getPublications(1, id),
    enabled: !!id,
  });

  // â”€â”€ Mutations â”€â”€
  const joinMutation = useMutation({
    mutationFn: () => joinGroup(id),
    onSuccess: () => {
      toast.success("Demande envoyée !");
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
    },
    onError: () => toast.error("Erreur lors de la demande."),
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => approveMember(id, userId),
    onSuccess: () => {
      toast.success("Membre accepté !");
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
      queryClient.invalidateQueries({ queryKey: ["group-requests", id] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: () => toast.error("Erreur lors de l'approbation."),
  });

  const rejectMutation = useMutation({
    mutationFn: (userId: string) => rejectMember(id, userId),
    onSuccess: () => {
      toast.success("Demande refusée.");
      queryClient.invalidateQueries({ queryKey: ["group-requests", id] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: () => toast.error("Erreur lors du refus."),
  });

  const handleValidate = (userId: string, action: "approve" | "reject") => {
    if (action === "approve") approveMutation.mutate(userId);
    else rejectMutation.mutate(userId);
  };

  const reactMutation = useMutation({
    mutationFn: (pubId: string) => reactToPublication(pubId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["publications", { group_id: id }],
      }),
  });

  const members = membersData?.data.data ?? [];
  const requests = requestsData?.data.data ?? [];
  const pubs = pubsData?.data?.data ?? [];

  const isMember = members.some((m) => m.id === currentUser?.id);
  const isPending = group?.membership_status === "pending";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
      {/* Back */}
      <Link href="/groups">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 -ml-1 text-muted-foreground h-8 text-xs"
        >
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
          <TabsTrigger value="publications" className="text-xs h-7">
            Publications
          </TabsTrigger>
          <TabsTrigger value="members" className="text-xs h-7 gap-1.5">
            <Users className="size-3" />
            Membres ({members.length})
          </TabsTrigger>
          {isModerator && (
            <TabsTrigger value="moderation" className="text-xs h-7 gap-1.5">
              <ShieldCheck className="size-3" />
              Modération
              {requests.length > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-[#B01817] text-[10px] text-white font-bold">
                  {requests.length}
                </span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="about" className="text-xs h-7 gap-1.5">
            <Info className="size-3" />À propos
          </TabsTrigger>
        </TabsList>

        {/* Publications */}
        <TabsContent value="publications" className="mt-4 space-y-4">
          {pubsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))
          ) : pubs.length === 0 ? (
            <EmptyState
              variant="feed"
              icon={undefined}
              title="Aucune publication dans ce groupe."
            />
          ) : (
            pubs.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onReact={(pid) => reactMutation.mutate(pid)}
              />
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
              <p className="text-sm text-muted-foreground">
                Impossible de charger les membres.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchMembers()}
                className="gap-2"
              >
                <RefreshCw className="size-4" /> Réessayer
              </Button>
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun membre.
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((m, i) => (
                <MemberRow key={m.id} member={m} index={i} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Moderation */}
        {isModerator && (
          <TabsContent value="moderation" className="mt-4 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#B01817]" />
              Demandes d&apos;adhésion
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
                <p className="text-sm text-muted-foreground">
                  Aucune demande en attente.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {requests.map((req, i) => (
                  <RequestRow
                    key={req.id}
                    member={req}
                    index={i}
                    isLoading={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                    onValidate={handleValidate}
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
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Description
                  </p>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {group.description ?? "Aucune description disponible."}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm pt-2 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Catégorie</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-1 text-[10px] border",
                        CAT_CONFIG[group.category]?.color,
                      )}
                    >
                      {CAT_CONFIG[group.category]?.label ?? group.category}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Membres</p>
                    <p className="font-semibold">{group.members_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Modérateur</p>
                    <p className="font-semibold truncate max-w-[120px]">
                      {group.moderator?.name}
                    </p>
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
