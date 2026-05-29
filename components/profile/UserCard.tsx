"use client";

import { useRouter } from "next/navigation";
import { FollowButton } from "./FollowButton";

interface UserCardUser {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  filiere?: string | null;
  annee?: string | null;
  is_following?: boolean;
}

interface UserCardProps {
  user: UserCardUser;
  isOwnProfile?: boolean;
}

export function UserCard({ user, isOwnProfile }: UserCardProps) {
  const router = useRouter();

  return (
    <div
      className="flex items-center justify-between gap-3 p-4 rounded-xl
                    bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
    >
      <button
        onClick={() => router.push(`/users/${user.username}`)}
        className="flex items-center gap-3 min-w-0 text-left"
      >
        <div
          className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0
                        bg-gradient-to-br from-red-700 to-red-900"
        >
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white text-sm truncate">
            {user.name}
          </p>
          <p className="text-white/50 text-xs truncate">@{user.username}</p>
          {user.filiere && (
            <p className="text-white/40 text-xs truncate">{user.filiere}</p>
          )}
        </div>
      </button>
      {!isOwnProfile && (
        <div className="flex-shrink-0">
          <FollowButton
            username={user.username}
            isFollowing={user.is_following ?? false}
          />
        </div>
      )}
    </div>
  );
}
