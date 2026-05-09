'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Crown, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getGroupMembers } from '@/lib/api/groups';
import Link from 'next/link';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: membersData, isLoading } = useQuery({
    queryKey: ['group-members', id],
    queryFn: () => getGroupMembers(id),
    enabled: !!id,
  });

  const members = membersData?.data.data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/groups">
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h2 className="text-base font-semibold">Détail du groupe</h2>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
          <Users className="size-4" />
          Membres ({members.length})
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member, i) => (
              <motion.div
                key={member.id}
                className="flex items-center gap-3 rounded-lg p-3 bg-card border border-border"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 30 }}
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
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
