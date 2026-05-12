/**
 * ENSIAS Eats — API layer
 * Uses the Hub's Laravel backend (apiClient) — same auth token (Sanctum).
 * Endpoints: /api/menu-items  /api/orders
 */
import apiClient from './client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EatsMeal {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
}

export interface EatsOrderItem {
  mealId: string;
  quantity: number;
}

export interface EatsOrderLine {
  id: string;
  meal: EatsMeal | null;
  quantity: number;
  unit_price: number;
}

export interface EatsOrder {
  id: string;
  status: 'en_attente' | 'en_preparation' | 'pret' | 'livre' | 'annule';
  total: number;
  items: EatsOrderLine[];
  notes?: string;
  created_at: string;
}

// ── Response wrapper ──────────────────────────────────────────────────────────

interface ApiSuccess<T> {
  success: boolean;
  data: T;
}

// ── Meals ─────────────────────────────────────────────────────────────────────

/** GET /api/menu-items  — returns only available items by default */
export const getMeals = (filters?: Record<string, string>) =>
  apiClient.get<ApiSuccess<EatsMeal[]>>('/menu-items', { params: filters });

/** GET /api/menu-items/categories */
export const getMealCategories = () =>
  apiClient.get<ApiSuccess<string[]>>('/menu-items/categories');

/** GET /api/menu-items/:id */
export const getMealById = (id: string) =>
  apiClient.get<ApiSuccess<EatsMeal>>(`/menu-items/${id}`);

// ── Orders ────────────────────────────────────────────────────────────────────

/** POST /api/orders  —  Body: { items: [{ mealId, quantity }], notes? } */
export const createOrder = (data: { items: EatsOrderItem[]; notes?: string }) =>
  apiClient.post<ApiSuccess<EatsOrder>>('/orders', data);

/** GET /api/orders  — authenticated user's orders */
export const getMyOrders = () =>
  apiClient.get<ApiSuccess<EatsOrder[]>>('/orders');

/** PATCH /api/orders/:id/cancel */
export const cancelOrder = (id: string) =>
  apiClient.patch<ApiSuccess<EatsOrder>>(`/orders/${id}/cancel`);
