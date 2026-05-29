"use client";

import Link from "next/link";
import { GraduationCap, Users, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMyGroups } from "@/lib/hooks/useFeed";

export function FeedSidebar() {
  const { filiereGroup, clubs, isLoading } = useMyGroups();

  if (isLoading) {
    return (
      <div className="rounded-2xl border dark:border-white/[0.07] border-black/[0.06] dark:bg-[#0d1117]/95 bg-white/90 backdrop-blur-sm p-4 dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)] shadow-[0_2px_16px_rgba(0,0,0,0.08)] transition-colors duration-700 flex items-center justify-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="size-4 animate-spin" />
        Chargement…
      </div>
    );
  }

  const hasContent = filiereGroup || clubs.length > 0;

  if (!hasContent) {
    return (
      <div className="rounded-2xl border dark:border-white/[0.07] border-black/[0.06] dark:bg-[#0d1117]/95 bg-white/90 backdrop-blur-sm p-4 dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)] shadow-[0_2px_16px_rgba(0,0,0,0.08)] transition-colors duration-700">
        <p className="text-xs text-muted-foreground">
          Rejoignez des groupes pour les voir ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filière group */}
      {filiereGroup && (
        <div className="rounded-2xl border dark:border-white/[0.07] border-black/[0.06] dark:bg-[#0d1117]/95 bg-white/90 backdrop-blur-sm p-4 dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)] shadow-[0_2px_16px_rgba(0,0,0,0.08)] transition-colors duration-700">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <GraduationCap className="size-4 text-blue-400" />
            Mon groupe filière
          </h3>
          <Link
            href={`/feed/${filiereGroup.id}`}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-muted/60 transition-colors group"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {filiereGroup.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filiereGroup.members_count} membre
                {filiereGroup.members_count !== 1 ? "s" : ""}
              </p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      )}

      {/* Clubs */}
      {clubs.length > 0 && (
        <div className="rounded-2xl border dark:border-white/[0.07] border-black/[0.06] dark:bg-[#0d1117]/95 bg-white/90 backdrop-blur-sm p-4 dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)] shadow-[0_2px_16px_rgba(0,0,0,0.08)] transition-colors duration-700">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Users className="size-4 text-purple-400" />
            Mes clubs
          </h3>
          <ul className="space-y-1">
            {clubs.map((club) => (
              <li key={club.id}>
                <Link
                  href={`/feed/${club.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/60 transition-colors group"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="text-sm truncate">{club.name}</span>
                    <Badge className="shrink-0 text-[10px] px-1.5 py-0 bg-purple-500/20 text-purple-400 border-purple-500/30">
                      Club
                    </Badge>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
