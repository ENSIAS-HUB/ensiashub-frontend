// Azure Drive — dedicated type definitions
// These complement the legacy types in lib/types/index.ts

export type DriveDocumentType =
  | "cours"
  | "td"
  | "tp"
  | "examen"
  | "corrige"
  | "resume"
  | "projet"
  | "autre";

export interface DriveFiliere {
  id: string;
  nom: string;
  slug: string | null;
  code: string | null;
  description: string | null;
  is_active: boolean;
  documents_count: number;
  modules: DriveModule[];
}

export interface DriveModule {
  id: string;
  filiere_id: string;
  nom: string;
  slug: string | null;
  semestre: string;
  annee: number;
  is_active: boolean;
  documents_count: number;
}

export interface DriveDocument {
  id: string;
  titre: string;
  nom: string | null;
  azure_url: string | null;
  download_url: string | null;
  preview_url: string | null;
  signed_url: string | null;
  urlStockage: string | null;
  mime_type: string | null;
  taille: number;
  size_formatted: string;
  extension: string | null;
  typeDocument: string;
  semester: string | null;
  year: number | null;
  downloads_count: number;
  views_count: number;
  is_saved: boolean;
  all_comments_count: number;
  created_at: string;
  uploader: {
    id: string;
    nom: string;
    prenom: string;
    photoProfil: string | null;
  } | null;
  filiere: DriveFiliere | null;
  module: DriveModule | null;
}

export interface UploadDrivePayload {
  file: File;
  title: string;
  description?: string;
  filiere_id?: string;
  module_id?: string;
  filiere_slug?: string;
  module_slug?: string;
  type: DriveDocumentType;
  semester?: string;
  year?: number;
}

export interface DriveFilters {
  filiere_id?: string;
  module_id?: string;
  semester?: string;
  type?: string;
  search?: string;
}

// ── Drive v2 (new architecture) ───────────────────────────────────────────────

export type DocumentType =
  | "Cours"
  | "TD"
  | "TP"
  | "Examen"
  | "Corrigé"
  | "Résumé"
  | "Projet";

export interface DriveDocument2 {
  id: string;
  titre: string;
  type: DocumentType;
  extension: string | null;
  taille_formatee: string;
  telechargements: number;
  vues: number;
  is_saved: boolean;
  azure_url: string | null;
  created_at: string;
  uploader: {
    id: string;
    nom: string;
    prenom: string;
    avatar_url: string | null;
  } | null;
}

export interface TypeGroup {
  type: DocumentType;
  count: number;
  documents: DriveDocument2[];
}

export interface ElementModuleItem {
  id: string;
  nom: string;
  slug: string;
  documents_count: number;
  types?: TypeGroup[];
}

export interface ModuleDrive {
  id: string;
  nom: string;
  slug: string;
  documents_count: number;
  filiere?: {
    nom: string;
    badge: string | null;
    is_tronc_commun: boolean;
  } | null;
}

export interface MesModulesResponse {
  filiere: { nom: string; badge: string | null };
  annee: string;
  modules: ModuleDrive[];
}

export interface DriveFiliere2 {
  id: string;
  nom: string;
  slug: string;
  badge: string | null;
  is_tronc_commun: boolean;
  modules_count: number;
}

export interface UploadDrivePayload2 {
  file: File;
  titre: string;
  description?: string;
  element_module_id: string;
  type: DocumentType;
}

// ── Arborescence (semestre → module → élément → type → fichiers) ──────────────

export interface ArborescenceDocument {
  id: string;
  titre: string;
  type: string;
  extension: string | null;
  taille_bytes: number;
  azure_url: string | null;
  nom_original: string | null;
  created_at: string;
}

export interface ArborescenceTypeGroup {
  type: string;
  count: number;
  documents: ArborescenceDocument[];
}

export interface ArborescenceElement {
  id: string;
  nom: string;
  documents_count: number;
  types: ArborescenceTypeGroup[];
}

export interface ArborescenceModule {
  id: string;
  nom: string;
  documents_count: number;
  elements: ArborescenceElement[];
}

export interface SemestreGroup {
  semestre: string;
  modules: ArborescenceModule[];
}

export interface ArborescenceResponse {
  annee: string;
  filiere?: string;
  arborescence: SemestreGroup[];
}
