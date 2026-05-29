"use client";

import { useState } from "react";
import { Loader2, UserCheck, UserMinus, UserPlus } from "lucide-react";
import { useFollow, useUnfollow } from "@/lib/hooks/useProfile";

interface FollowButtonProps {
  username: string;
  isFollowing: boolean;
  followersCount?: number;
}

export function FollowButton({ username, isFollowing }: FollowButtonProps) {
  const { mutate: follow, isPending: followPending } = useFollow(username);
  const { mutate: unfollow, isPending: unfollowPending } =
    useUnfollow(username);
  const [hovering, setHovering] = useState(false);

  const isPending = followPending || unfollowPending;

  const handleClick = () => {
    if (isFollowing) {
      unfollow();
    } else {
      follow();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={[
        "px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
        "flex items-center gap-2",
        isFollowing
          ? hovering
            ? "bg-red-600/20 text-red-400 border border-red-500/30"
            : "bg-white/10 text-white border border-white/20"
          : "bg-red-600 text-white hover:bg-red-700",
        isPending ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {isPending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isFollowing ? (
        hovering ? (
          <>
            <UserMinus size={14} /> Ne plus suivre
          </>
        ) : (
          <>
            <UserCheck size={14} /> Abonné(e)
          </>
        )
      ) : (
        <>
          <UserPlus size={14} /> Suivre
        </>
      )}
    </button>
  );
}
