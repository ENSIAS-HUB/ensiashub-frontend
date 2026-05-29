"use client";

import { use, useState } from "react";
import { useUserProfile } from "@/lib/hooks/useProfile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import type { TabId } from "@/components/profile/ProfileTabs";
import { AboutTab } from "@/components/profile/tabs/AboutTab";
import { ProjectsTab } from "@/components/profile/tabs/ProjectsTab";
import { ActivityTab } from "@/components/profile/tabs/ActivityTab";
import { ConnectionsTab } from "@/components/profile/tabs/ConnectionsTab";
import { EditProfileModal } from "@/components/profile/EditProfileModal";

interface Props {
  params: Promise<{ username: string }>;
}

function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div className="h-72 rounded-2xl bg-white/5 animate-pulse" />
      <div className="h-12 rounded-xl bg-white/5 animate-pulse" />
      <div className="h-48 rounded-xl bg-white/5 animate-pulse" />
    </div>
  );
}

export default function UserProfilePage({ params }: Props) {
  const { username } = use(params);
  const { data: user, isLoading } = useUserProfile(username);
  const [activeTab, setActiveTab] = useState<TabId>("about");
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) return <ProfileSkeleton />;

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-white/50">
        Utilisateur introuvable.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <ProfileHeader
        user={user}
        isOwnProfile={user.is_own_profile}
        onEditClick={() => setEditOpen(true)}
      />

      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "about" && <AboutTab user={user} />}
      {activeTab === "projects" && (
        <ProjectsTab
          username={user.username}
          isOwnProfile={user.is_own_profile}
        />
      )}
      {activeTab === "activity" && <ActivityTab username={user.username} />}
      {activeTab === "connections" && (
        <ConnectionsTab
          username={user.username}
          isOwnProfile={user.is_own_profile}
        />
      )}

      {editOpen && user.is_own_profile && (
        <EditProfileModal user={user} onClose={() => setEditOpen(false)} />
      )}
    </div>
  );
}
