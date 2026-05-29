"use client";

import { useRef, useState } from "react";
import {
  useMyProfile,
  useUpdateAvatar,
  useDeleteAvatar,
  useUpdateCover,
  useDeleteCover,
} from "@/lib/hooks/useProfile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import type { TabId } from "@/components/profile/ProfileTabs";
import { AboutTab } from "@/components/profile/tabs/AboutTab";
import { ProjectsTab } from "@/components/profile/tabs/ProjectsTab";
import { ActivityTab } from "@/components/profile/tabs/ActivityTab";
import { ConnectionsTab } from "@/components/profile/tabs/ConnectionsTab";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { AvatarCropModal } from "@/components/profile/AvatarCropModal";

function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div className="h-72 rounded-2xl bg-white/5 animate-pulse" />
      <div className="h-12 rounded-xl bg-white/5 animate-pulse" />
      <div className="h-48 rounded-xl bg-white/5 animate-pulse" />
    </div>
  );
}

export default function MyProfilePage() {
  const { data: user, isLoading } = useMyProfile();
  const [activeTab, setActiveTab] = useState<TabId>("about");
  const [editOpen, setEditOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const updateAvatarMutation = useUpdateAvatar();
  const deleteAvatarMutation = useDeleteAvatar();
  const updateCoverMutation = useUpdateCover();
  const deleteCoverMutation = useDeleteCover();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setCropSrc(objectUrl);
    }
    e.target.value = "";
  };

  const handleCropConfirm = (croppedFile: File) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    updateAvatarMutation.mutate(croppedFile);
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) updateCoverMutation.mutate(file);
    e.target.value = "";
  };

  if (isLoading) return <ProfileSkeleton />;

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-white/50">
        Impossible de charger le profil.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverChange}
      />

      <ProfileHeader
        user={user}
        isOwnProfile={true}
        onEditClick={() => setEditOpen(true)}
        onAvatarClick={() => avatarInputRef.current?.click()}
        onAvatarDeleteClick={
          user.avatar_url ? () => deleteAvatarMutation.mutate() : undefined
        }
        onCoverClick={() => coverInputRef.current?.click()}
        onCoverDeleteClick={
          user.cover_url ? () => deleteCoverMutation.mutate() : undefined
        }
      />

      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "about" && <AboutTab user={user} />}
      {activeTab === "projects" && (
        <ProjectsTab username={user.username} isOwnProfile={true} />
      )}
      {activeTab === "activity" && <ActivityTab username={user.username} />}
      {activeTab === "connections" && (
        <ConnectionsTab username={user.username} isOwnProfile={true} />
      )}

      {editOpen && (
        <EditProfileModal user={user} onClose={() => setEditOpen(false)} />
      )}

      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
