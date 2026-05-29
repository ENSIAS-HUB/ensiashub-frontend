"use client";

import { useState } from "react";
import { useUserFollowers, useUserFollowing } from "@/lib/hooks/useProfile";
import { UserCard } from "../UserCard";

interface ConnectionsTabProps {
  username: string;
  isOwnProfile: boolean;
}

type View = "followers" | "following";

export function ConnectionsTab({
  username,
  isOwnProfile,
}: ConnectionsTabProps) {
  const [view, setView] = useState<View>("followers");

  const { data: followersData, isLoading: loadingFollowers } =
    useUserFollowers(username);
  const { data: followingData, isLoading: loadingFollowing } =
    useUserFollowing(username);

  const isLoading = view === "followers" ? loadingFollowers : loadingFollowing;
  const users =
    view === "followers"
      ? (followersData?.data ?? [])
      : (followingData?.data ?? []);

  return (
    <div className="space-y-4">
      {/* Sous-navigation */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        <button
          onClick={() => setView("followers")}
          className={[
            "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
            view === "followers"
              ? "bg-white/10 text-white"
              : "text-white/50 hover:text-white/80",
          ].join(" ")}
        >
          Abonnés ({followersData?.total ?? 0})
        </button>
        <button
          onClick={() => setView("following")}
          className={[
            "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
            view === "following"
              ? "bg-white/10 text-white"
              : "text-white/50 hover:text-white/80",
          ].join(" ")}
        >
          Abonnements ({followingData?.total ?? 0})
        </button>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-2">
          {users.map((user) => (
            <UserCard key={user.id} user={user} isOwnProfile={isOwnProfile} />
          ))}
        </div>
      ) : (
        <p className="text-center text-white/40 py-12">
          {view === "followers" ? "Aucun abonné" : "Aucun abonnement"}
        </p>
      )}
    </div>
  );
}
