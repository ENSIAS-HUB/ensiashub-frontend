export type RoleType =
  | "etudiant"
  | "delegue"
  | "president_club"
  | "chef_scolarite"
  | "admin"
  | "superAdmin"
  | "cuisinier";
export type ValidationStatus = "pending" | "approved" | "rejected";
/** Legacy eats status (keep for backward compat with existing order pages) */
export type OrderStatus =
  | "en_attente"
  | "en_preparation"
  | "pret"
  | "livre"
  | "annule";
/** Kitchen status — source of truth for the cuisine interface */
export type KitchenOrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export interface KitchenOrderItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  special_instructions?: string | null;
}

export interface KitchenOrder {
  id: string;
  status: KitchenOrderStatus;
  total_price: number;
  notes?: string | null;
  created_at: string;
  customer: {
    id: string;
    name: string;
    filiere?: string | null;
    annee?: string | null;
  } | null;
  items: KitchenOrderItem[];
}

export interface KitchenStats {
  pending: number;
  confirmed: number;
  preparing: number;
  ready: number;
  completed_today: number;
  cancelled_today: number;
}

export interface KitchenOrderFilters {
  status?: KitchenOrderStatus;
  date?: string;
  search?: string;
}
export type DeviceType = "contact" | "vibration";
export type GroupCategory = "filiere" | "club" | "general";
export type DocumentType = "cours" | "resume" | "examen" | "td";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  avatar_url?: string | null;
  username?: string | null;
  role: RoleType;
  roles?: RoleType[];
  contextual_roles?: ContextualRole[];
  filiere?: string | null;
  annee?: string | null;
  bio?: string | null;
  created_at: string;
}

export interface ContextualRole {
  role: RoleType;
  context_type: "group" | "filiere" | null;
  context_id: string | null;
}

export interface MembershipRequest {
  id: string;
  user: User;
  requested_at: string;
}

export interface ClubPendingReview {
  group: Group;
  requests: MembershipRequest[];
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: GroupCategory;
  avatar_url?: string | null;
  cover_url?: string | null;
  cover_image?: string | null; // backward-compat alias
  instagram_handle?: string | null;
  instagram_url?: string | null;
  members_count: number;
  moderator?: User | null;
  /** 'none' | 'pending' | 'approved' | 'rejected' | 'banned' */
  membership_status?: string;
  is_member?: boolean;
  filiere_key?: string | null;
  annee_filiere?: string | null;
  auto_assigned?: boolean;
  created_at: string;
}

export interface PostMedia {
  id: string;
  url: string;
  type: "image" | "video";
  thumbnail_url: string | null;
  order: number;
}

export interface MyGroups {
  filiere_group: Group | null;
  clubs: Group[];
}

export interface Publication {
  id: string;
  content: string;
  media_url?: string;
  media: PostMedia[];
  visibility: "global" | "group";
  status: ValidationStatus;
  author: User;
  group?: Group | null;
  reactions_count: number;
  comments_count: number;
  user_reacted: boolean;
  is_saved?: boolean;
  source?: "manual" | "instagram_import";
  instagram_url?: string | null;
  imported_at?: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  publication_id: string;
  created_at: string;
}

export interface Filiere {
  id: string;
  nom: string;
  name?: string; // alias for compatibility
  code?: string;
  modules_count?: number;
  modules?: Module[];
}

export interface Module {
  id: string;
  nom: string;
  name?: string; // alias for compatibility
  filiere_id: string;
  semestre?: string;
  semester?: number; // alias for compatibility
  annee?: number;
  documents?: Document[];
}

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  file_url: string;
  preview_url: string;
  download_url: string;
  file_size: number;
  status: ValidationStatus;
  uploader: User;
  module: Module;
  created_at: string;
}

export interface MenuItem {
  id: string;
  nomPlat?: string;
  name?: string;
  description?: string;
  prix?: number;
  price?: number;
  categorie?: string;
  category?: string;
  estDisponible?: boolean;
  available?: boolean;
  image_url?: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  items: OrderLine[];
  user: User;
  created_at: string;
}

export interface OrderLine {
  id: string;
  menu_item: MenuItem;
  quantity: number;
  unit_price: number;
}

export interface IoTDevice {
  id: string;
  idMateriel: string;
  name?: string;
  typeCapteur: string;
  type?: DeviceType;
  emplacement: string;
  location?: string;
  statutActuel: boolean;
  is_active?: boolean;
  last_event?: DeviceEvent;
  laundry_machine_id?: string | null;
}

export interface LaundryMachine {
  id: string;
  name: string;
  is_available: boolean;
  last_updated: string;
}

export interface DeviceEvent {
  id: string;
  device_id: string;
  status: string;
  value: unknown;
  recorded_at: string;
}

export interface POI {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  category: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
