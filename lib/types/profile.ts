import type { Group } from "@/lib/types";

export type UserRole =
  | "superadmin"
  | "superAdmin"
  | "etudiant"
  | "delegue"
  | "buvette"
  | "scolarite"
  | "chef_scolarite"
  | "president_club"
  | "admin";

export type ActivityType =
  | "post_created"
  | "comment_added"
  | "document_added"
  | "club_joined"
  | "project_added"
  | "post_liked";

export interface ProfileContextualRole {
  role: UserRole;
  context_name: string | null;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  filiere: string | null;
  annee: string | null;
  specialite: string | null;
  ville: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  competences: string[];
  role: UserRole;
  contextual_roles: ProfileContextualRole[];
  followers_count: number;
  following_count: number;
  projects_count: number;
  is_following: boolean;
  is_own_profile: boolean;
  filiere_group: Group | null;
  clubs: Group[];
}

export interface FollowUser {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  filiere: string | null;
  annee: string | null;
  is_following: boolean;
}

export interface Project {
  id: number;
  titre: string;
  description: string | null;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  image_url: string | null;
  is_featured: boolean;
  status: "terminé" | "en_cours" | "en_pause";
  date_debut: string | null;
  date_fin: string | null;
  ordre: number;
}

export interface ProfileActivity {
  id: number;
  type: ActivityType;
  description: string;
  created_at: string;
}

export interface UpdateProfilePayload {
  username?: string;
  bio?: string;
  ville?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  specialite?: string;
  competences?: string[];
  phone?: string;
}

export interface CreateProjectPayload {
  titre: string;
  description?: string;
  tech_stack?: string[];
  github_url?: string;
  live_url?: string;
  image_url?: string;
  is_featured?: boolean;
  status?: Project["status"];
  date_debut?: string;
  date_fin?: string;
}

export interface UpdateProjectPayload extends Partial<CreateProjectPayload> {
  id: number;
}
