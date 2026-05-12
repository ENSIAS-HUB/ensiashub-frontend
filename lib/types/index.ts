export type RoleType = 'etudiant' | 'delegue' | 'president_club' | 'chef_scolarite' | 'admin' | 'superAdmin';
export type ValidationStatus = 'pending' | 'approved' | 'rejected';
export type OrderStatus = 'en_attente' | 'en_preparation' | 'pret' | 'livre' | 'annule';
export type DeviceType = 'contact' | 'vibration';
export type GroupCategory = 'filiere' | 'club' | 'general';
export type DocumentType = 'cours' | 'resume' | 'examen' | 'td';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: RoleType;
  roles?: RoleType[];
  filiere?: string | null;
  annee?: string | null;
  bio?: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  category: GroupCategory;
  cover_image?: string;
  members_count: number;
  moderator?: User | null;
  /** 'none' | 'pending' | 'approved' | 'rejected' | 'banned' */
  membership_status?: string;
  is_member?: boolean;
  created_at: string;
}

export interface Publication {
  id: string;
  content: string;
  media_url?: string;
  status: ValidationStatus;
  author: User;
  group?: Group | null;
  reactions_count: number;
  comments_count: number;
  user_reacted: boolean;
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
  semester?: number;  // alias for compatibility
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
