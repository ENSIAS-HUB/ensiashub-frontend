"use client";

import { useUserActivity } from "@/lib/hooks/useProfile";
import type { ActivityType } from "@/lib/types/profile";

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: string; color: string; label: string }
> = {
  post_created: { icon: "📝", color: "text-blue-400", label: "a publié" },
  comment_added: { icon: "💬", color: "text-green-400", label: "a commenté" },
  document_added: {
    icon: "📄",
    color: "text-purple-400",
    label: "a ajouté un document",
  },
  club_joined: { icon: "🎯", color: "text-yellow-400", label: "a rejoint" },
  project_added: {
    icon: "🚀",
    color: "text-red-400",
    label: "a ajouté le projet",
  },
  post_liked: { icon: "❤️", color: "text-pink-400", label: "a aimé" },
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}

export function ActivityTab({ username }: { username: string }) {
  const { data, isLoading } = useUserActivity(username);

  if (isLoading) return <ActivitySkeleton />;

  const activities = data?.data ?? [];

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const config = ACTIVITY_CONFIG[activity.type];
        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-4 rounded-xl
                       bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
          >
            <span className="text-xl">{config.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80">
                <span className={`font-medium ${config.color}`}>
                  {config.label}
                </span>{" "}
                <span className="text-white">{activity.description}</span>
              </p>
              <p className="text-xs text-white/40 mt-1">
                {formatRelativeTime(activity.created_at)}
              </p>
            </div>
          </div>
        );
      })}
      {activities.length === 0 && (
        <p className="text-center text-white/40 py-12">
          Aucune activité récente
        </p>
      )}
    </div>
  );
}
