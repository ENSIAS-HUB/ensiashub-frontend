import {
  Zap,
  Users,
  BookOpen,
  UtensilsCrossed,
  Radio,
  Map,
  type LucideIcon,
} from "lucide-react";
import type { RoleType } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Liste des rôles autorisés, ou 'all' pour tout le monde. */
  allowedRoles: RoleType[] | "all";
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/feed",
    label: "Feed",
    icon: Zap,
    allowedRoles: [
      "etudiant",
      "delegue",
      "president_club",
      "chef_scolarite",
      "admin",
      "superAdmin",
    ],
  },
  {
    href: "/groups",
    label: "Groupes",
    icon: Users,
    allowedRoles: [
      "etudiant",
      "delegue",
      "president_club",
      "admin",
      "superAdmin",
    ],
  },
  {
    href: "/drive",
    label: "The Drive",
    icon: BookOpen,
    allowedRoles: [
      "etudiant",
      "delegue",
      "president_club",
      "chef_scolarite",
      "admin",
      "superAdmin",
    ],
  },
  {
    href: "/eats",
    label: "ENSIAS Eats",
    icon: UtensilsCrossed,
    allowedRoles: "all",
  },
  {
    href: "/smart-campus",
    label: "Smart Campus",
    icon: Radio,
    allowedRoles: [
      "etudiant",
      "delegue",
      "president_club",
      "chef_scolarite",
      "admin",
      "superAdmin",
    ],
  },
  {
    href: "/map",
    label: "Carte",
    icon: Map,
    allowedRoles: [
      "etudiant",
      "delegue",
      "president_club",
      "admin",
      "superAdmin",
    ],
  },
];

/** Retourne les items visibles pour un rôle donné. */
export function getVisibleNavItems(
  role: RoleType | null | undefined,
): NavItem[] {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => {
    if (item.allowedRoles === "all") return true;
    return (item.allowedRoles as RoleType[]).includes(role);
  });
}
