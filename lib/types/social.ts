// ── Types polymorphiques sociaux ───────────────────────────────────────────

export type SocialableType = 'publications' | 'documents' | 'projects' | 'menu-items';

/** Alias spec-compatible (publications = posts dans notre projet) */
export type EntityType = SocialableType;

export type ShareChannel = 'internal' | 'link' | 'whatsapp' | 'other';

export type ReportReason =
  | 'spam'
  | 'inappropriate'
  | 'harassment'
  | 'misinformation'
  | 'other';

// ── Commentaire ────────────────────────────────────────────────────────────

export interface SocialUser {
  id: string; // UUID
  nom: string;
  prenom: string;
  avatar_url: string | null;
  photoProfil?: string | null;
}

export interface SocialComment {
  id: number;
  content: string;
  is_deleted: boolean;
  parent_id: number | null;
  user: SocialUser;
  replies: SocialComment[];
  replies_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommentsPaginated {
  data: SocialComment[];
  current_page: number;
  last_page: number;
  total: number;
}

// ── Sauvegarde ─────────────────────────────────────────────────────────────

export interface SavedItem {
  id: number;
  saveable_type: string;
  saveable_id: string | number;
  collection: string;
  created_at: string;
  saveable?: Record<string, unknown>;
}

// ── Partage ────────────────────────────────────────────────────────────────

export interface Share {
  id: number;
  channel: ShareChannel;
  shareable_type: string;
  shareable_id: string | number;
  target_group_id: number | null;
  created_at: string;
}

// ── Signalement ────────────────────────────────────────────────────────────

export interface Report {
  id: number;
  reason: ReportReason;
  details: string | null;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
}
