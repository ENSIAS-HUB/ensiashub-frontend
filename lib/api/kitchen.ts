/**
 * ENSIAS Eats — Kitchen API layer
 * Endpoints: /api/kitchen/orders  /api/kitchen/stats
 */
import apiClient from './client';
import type {
  KitchenOrder,
  KitchenOrderFilters,
  KitchenOrderStatus,
  KitchenStats,
} from '@/lib/types';

interface ApiSuccess<T> {
  success: boolean;
  data: T;
}

// ── Orders ────────────────────────────────────────────────────────────────────

/** GET /api/kitchen/orders */
export const getKitchenOrders = (filters?: KitchenOrderFilters) =>
  apiClient.get<ApiSuccess<KitchenOrder[]>>('/kitchen/orders', {
    params: filters,
  });

/** GET /api/kitchen/orders/:id */
export const getKitchenOrder = (orderId: string) =>
  apiClient.get<ApiSuccess<KitchenOrder>>(`/kitchen/orders/${orderId}`);

/** PATCH /api/kitchen/orders/:id/status */
export const updateKitchenOrderStatus = (
  orderId: string,
  status: KitchenOrderStatus,
) =>
  apiClient.patch<ApiSuccess<KitchenOrder>>(
    `/kitchen/orders/${orderId}/status`,
    { status },
  );

// ── Stats ─────────────────────────────────────────────────────────────────────

/** GET /api/kitchen/stats */
export const getKitchenStats = () =>
  apiClient.get<ApiSuccess<KitchenStats>>('/kitchen/stats');
