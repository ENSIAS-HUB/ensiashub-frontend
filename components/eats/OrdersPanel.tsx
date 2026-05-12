'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, XCircle, Clock, ChefHat, PackageCheck, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { getMyOrders, cancelOrder } from '@/lib/api/eats';
import type { EatsOrder } from '@/lib/api/eats';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type OrderStatus = EatsOrder['status'];

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badgeClass: string; icon: React.ElementType }
> = {
  en_attente:     { label: 'En attente',     badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',  icon: Clock },
  en_preparation: { label: 'En préparation', badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',        icon: ChefHat },
  pret:           { label: 'Prêt',           badgeClass: 'bg-green-500/20 text-green-400 border-green-500/30',     icon: PackageCheck },
  livre:          { label: 'Livré',          badgeClass: 'bg-slate-500/20 text-slate-400 border-slate-500/30',     icon: CheckCircle2 },
  annule:         { label: 'Annulé',         badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',           icon: XCircle },
};

function OrderRow({ order }: { order: EatsOrder }) {
  const queryClient = useQueryClient();
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.en_attente;
  const Icon = cfg.icon;

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(order.id),
    onSuccess: () => {
      toast.success('Commande annulée.');
      queryClient.invalidateQueries({ queryKey: ['eats-my-orders'] });
    },
    onError: () => toast.error('Impossible d\'annuler la commande.'),
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Commande #{order.id.slice(0, 8)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(order.created_at).toLocaleString('fr-FR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Badge variant="outline" className={cn('flex items-center gap-1 text-[10px]', cfg.badgeClass)}>
          <Icon className="size-3" />
          {cfg.label}
        </Badge>
      </div>

      {order.items.length > 0 && (
        <div className="space-y-1">
          {order.items.map((line) => (
            <div key={line.id} className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {line.meal?.name ?? '—'} × {line.quantity}
              </span>
              <span>{(line.unit_price * line.quantity).toFixed(2)} MAD</span>
            </div>
          ))}
        </div>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[#B01817]">{order.total.toFixed(2)} MAD</span>
        {order.status === 'en_attente' && (
          <Button
            size="sm"
            variant="outline"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
            className="h-7 text-xs gap-1 border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <XCircle className="size-3.5" />
            Annuler
          </Button>
        )}
      </div>
    </div>
  );
}

export function OrdersPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['eats-my-orders'],
    queryFn: () => getMyOrders(),
    refetchInterval: 15_000,
  });

  const orders: EatsOrder[] = Array.isArray(data?.data?.data) ? data.data.data :
                              Array.isArray(data?.data) ? (data.data as unknown as EatsOrder[]) : [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <ClipboardList className="size-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Aucune commande</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </div>
  );
}
