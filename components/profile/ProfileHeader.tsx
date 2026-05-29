"use client";

import {
  Camera,
  Trash2,
  Globe,
  MapPin,
  MessageCircle,
  Pencil,
} from "lucide-react";
import type { UserProfile } from "@/lib/types/profile";
import { BadgeList } from "./BadgeList";
import { FollowButton } from "./FollowButton";
import { getStorageUrl } from "@/lib/utils";

interface StatItemProps {
  value: number;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="text-center">
      <p className="text-white font-bold text-lg">{value}</p>
      <p className="text-white/50 text-xs">{label}</p>
    </div>
  );
}

interface ProfileHeaderProps {
  user: UserProfile;
  isOwnProfile: boolean;
  onEditClick: () => void;
  onAvatarClick?: () => void;
  onAvatarDeleteClick?: () => void;
  onCoverClick?: () => void;
  onCoverDeleteClick?: () => void;
}

export function ProfileHeader({
  user,
  isOwnProfile,
  onEditClick,
  onAvatarClick,
  onAvatarDeleteClick,
  onCoverClick,
  onCoverDeleteClick,
}: ProfileHeaderProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#111827]">
      {/* ── BANNIÈRE ─────────────────────────────────────────────── */}
      <div className="relative h-52 bg-gradient-to-br from-[#1a2a4a] to-[#0f1923] group">
        {user.cover_url && (
          <img
            src={getStorageUrl(user.cover_url)}
            alt="Bannière"
            className="w-full h-full object-cover opacity-80"
          />
        )}
        {isOwnProfile && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button
              onClick={onCoverClick}
              className="bg-black/60 text-white text-xs px-3 py-1.5
                         rounded-lg flex items-center gap-1.5"
            >
              <Camera size={12} /> Modifier la bannière
            </button>
            {onCoverDeleteClick && (
              <button
                onClick={onCoverDeleteClick}
                className="bg-black/60 text-white text-xs px-3 py-1.5
                           rounded-lg flex items-center gap-1.5 hover:bg-red-700/80 transition-colors"
              >
                <Trash2 size={12} /> Supprimer
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── AVATAR + ACTIONS ──────────────────────────────────────── */}
      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-12 mb-4">
          {/* Avatar */}
          <div className="relative group">
            <div
              className="w-24 h-24 rounded-full border-4 border-[#111827]
                            overflow-hidden bg-[#1e2a3a]"
            >
              {user.avatar_url ? (
                <img
                  src={getStorageUrl(user.avatar_url)}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center
                                bg-gradient-to-br from-red-700 to-red-900"
                >
                  <span className="text-2xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {isOwnProfile && (
              <button
                onClick={onAvatarClick}
                className="absolute inset-0 rounded-full bg-black/50
                           opacity-0 group-hover:opacity-100 transition-opacity
                           flex items-center justify-center"
              >
                <Camera size={20} className="text-white" />
              </button>
            )}
          </div>
          {isOwnProfile && onAvatarDeleteClick && (
            <button
              onClick={onAvatarDeleteClick}
              className="mt-1 text-[11px] text-white/40 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <Trash2 size={11} /> Supprimer la photo
            </button>
          )}

          {/* Boutons d'action */}
          <div className="flex items-center gap-2 mt-14">
            {isOwnProfile ? (
              <button
                onClick={onEditClick}
                className="px-4 py-2 rounded-xl border border-white/20
                           text-white text-sm hover:bg-white/10 transition-colors
                           flex items-center gap-2"
              >
                <Pencil size={14} /> Modifier le profil
              </button>
            ) : (
              <>
                <FollowButton
                  username={user.username}
                  isFollowing={user.is_following}
                  followersCount={user.followers_count}
                />
                <button
                  className="px-4 py-2 rounded-xl border border-white/20
                                   text-white text-sm hover:bg-white/10 transition-colors"
                >
                  <MessageCircle size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── IDENTITÉ ─────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-white/50 text-sm">@{user.username}</p>
          </div>

          {/* Titre académique */}
          {user.filiere && (
            <p className="text-white/80 text-sm font-medium">
              Élève Ingénieur en {user.filiere}
              {user.specialite ? `/${user.specialite}` : ""} — ENSIAS Rabat
            </p>
          )}

          {/* Badges */}
          <BadgeList role={user.role} contextualRoles={user.contextual_roles} />

          {/* Bio */}
          {user.bio && (
            <p className="text-white/70 text-sm leading-relaxed max-w-2xl mt-2">
              {user.bio}
            </p>
          )}

          {/* Infos de contact */}
          <div className="flex flex-wrap items-center gap-4 text-white/50 text-sm mt-3">
            {user.ville && (
              <span className="flex items-center gap-1">
                <MapPin size={13} /> {user.ville}
              </span>
            )}
            {user.linkedin_url && (
              <a
                href={user.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-blue-400 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>{" "}
                LinkedIn
              </a>
            )}
            {user.github_url && (
              <a
                href={user.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>{" "}
                GitHub
              </a>
            )}
            {user.website_url && (
              <a
                href={user.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-green-400 transition-colors"
              >
                <Globe size={13} /> Portfolio
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-3 border-t border-white/10 mt-3">
            <StatItem value={user.followers_count} label="Abonnés" />
            <StatItem value={user.following_count} label="Abonnements" />
            <StatItem value={user.projects_count} label="Projets" />
          </div>
        </div>
      </div>
    </div>
  );
}
