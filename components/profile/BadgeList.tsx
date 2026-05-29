"use client";

import type { UserRole, ProfileContextualRole } from "@/lib/types/profile";

const BADGE_CONFIG: Record<string, { label: string; color: string }> = {
  superadmin: { label: "Super Admin", color: "bg-[#B01817]" },
  superAdmin: { label: "Super Admin", color: "bg-[#B01817]" },
  president_club: { label: "Président de Club", color: "bg-red-600" },
  delegue: { label: "Délégué", color: "bg-blue-600" },
  chef_scolarite: { label: "Chef Scolarité", color: "bg-indigo-600" },
  scolarite: { label: "Scolarité", color: "bg-indigo-600" },
  buvette: { label: "Buvette", color: "bg-orange-600" },
  etudiant: { label: "Étudiant", color: "bg-slate-600" },
  admin: { label: "Admin", color: "bg-[#B01817]" },
};

interface BadgeListProps {
  role: UserRole;
  contextualRoles?: ProfileContextualRole[];
}

export function BadgeList({ role, contextualRoles }: BadgeListProps) {
  const mainBadge = BADGE_CONFIG[role];

  return (
    <div className="flex flex-wrap gap-2">
      {mainBadge && (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
                      text-xs font-semibold text-white ${mainBadge.color}`}
        >
          {mainBadge.label}
        </span>
      )}
      {contextualRoles?.map((cr, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
                     text-xs font-semibold text-white bg-emerald-700"
        >
          {cr.context_name}
        </span>
      ))}
    </div>
  );
}
