"use client";

import { useAuthStore } from "@/lib/store/authStore";
import { DriveAdminView } from "@/components/drive/DriveAdminView";
import { DriveStudentView } from "@/components/drive/DriveStudentView";

const ADMIN_ROLES = ["superAdmin", "admin", "chef_scolarite", "scolarite"];
const BLOCKED_ROLES = ["cuisinier", "buvette"];

export default function DrivePage() {
  const user = useAuthStore((s) => s.user);
  const roles: string[] = user?.roles ?? (user?.role ? [user.role] : []);

  if (roles.some((r) => BLOCKED_ROLES.includes(r))) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="space-y-2">
          <p className="text-lg font-semibold">Accès non autorisé</p>
          <p className="text-sm text-muted-foreground">
            Vous n&apos;avez pas accès à The Drive.
          </p>
        </div>
      </div>
    );
  }

  if (roles.some((r) => ADMIN_ROLES.includes(r))) {
    return <DriveAdminView />;
  }

  return <DriveStudentView />;
}


