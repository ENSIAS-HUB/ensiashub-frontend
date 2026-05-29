import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getKitchenOrders,
  getKitchenOrder,
  getKitchenStats,
  updateKitchenOrderStatus,
} from '@/lib/api/kitchen';
import type { KitchenOrderFilters, KitchenOrderStatus } from '@/lib/types';

const REFETCH_INTERVAL = 10_000; // 10 s

// ── Queries ───────────────────────────────────────────────────────────────────

export const useKitchenOrders = (filters?: KitchenOrderFilters) =>
  useQuery({
    queryKey: ['kitchen-orders', filters],
    queryFn: () => getKitchenOrders(filters).then((r) => r.data.data),
    refetchInterval: REFETCH_INTERVAL,
  });

export const useKitchenOrder = (orderId: string) =>
  useQuery({
    queryKey: ['kitchen-order', orderId],
    queryFn: () => getKitchenOrder(orderId).then((r) => r.data.data),
    enabled: !!orderId,
  });

export const useKitchenStats = () =>
  useQuery({
    queryKey: ['kitchen-stats'],
    queryFn: () => getKitchenStats().then((r) => r.data.data),
    refetchInterval: REFETCH_INTERVAL,
  });

// ── Mutations ─────────────────────────────────────────────────────────────────

export const useUpdateKitchenOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: KitchenOrderStatus;
    }) => updateKitchenOrderStatus(orderId, status).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-stats'] });
    },
  });
};
