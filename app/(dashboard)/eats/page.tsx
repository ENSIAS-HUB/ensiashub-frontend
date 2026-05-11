'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ClipboardList,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/common/EmptyState';
import { AnimatedList } from '@/components/common/AnimatedList';
import { getMenuItems, createOrder, getMyOrders, cancelOrder } from '@/lib/api/eats';
import { useCartStore } from '@/lib/store/cartStore';
import type { MenuItem, Order, OrderStatus } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: typeof Clock; step: number }> = {
  en_attente:    { label: 'En attente',    color: 'text-yellow-400',  icon: Clock,        step: 0 },
  en_preparation:{ label: 'En préparation',color: 'text-blue-400',    icon: ChefHat,      step: 1 },
  pret:          { label: 'Prêt',          color: 'text-green-400',   icon: PackageCheck, step: 2 },
  livre:         { label: 'Livré',         color: 'text-slate-400',   icon: CheckCircle2, step: 3 },
  annule:        { label: 'Annulé',        color: 'text-destructive', icon: XCircle,      step: -1 },
};

const STEPS: OrderStatus[] = ['en_attente', 'en_preparation', 'pret', 'livre'];

// ── MenuItemCard ─────────────────────────────────────────────────────────────
function MenuItemCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  return (
    <motion.div
      className={cn(
        'rounded-xl border bg-card p-4 space-y-3',
        item.available ? 'border-border hover:border-[#B01817]/20' : 'border-border opacity-50'
      )}
      whileHover={item.available ? { scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt={item.name} className="w-full h-28 object-cover rounded-lg" />
      ) : (
        <div className="w-full h-20 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center text-3xl">
          🍽️
        </div>
      )}
      <div>
        <h3 className="font-semibold text-sm">{item.name}</h3>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <Badge variant="outline" className="text-xs">{item.category}</Badge>
          <span className="text-sm font-bold text-[#B01817]">{item.price != null ? item.price.toFixed(2) : '—'} MAD</span>
        </div>
      </div>
      <Button
        size="sm"
        className="w-full h-8 text-xs bg-[#B01817] hover:bg-[#8f1211] text-white"
        disabled={!item.available}
        onClick={() => onAdd(item)}
      >
        <Plus className="size-3.5 mr-1.5" />
        {item.available ? 'Ajouter' : 'Non disponible'}
      </Button>
    </motion.div>
  );
}

// ── OrderStepper ─────────────────────────────────────────────────────────────
function OrderStepper({ status }: { status: OrderStatus }) {
  if (status === 'annule') return null;
  const currentStep = STATUS_CONFIG[status].step;
  return (
    <div className="flex items-center gap-1 mt-3">
      {STEPS.map((s, i) => {
        const cfg = STATUS_CONFIG[s];
        const done = i <= currentStep;
        return (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors',
                done ? 'bg-[#B01817] text-white' : 'bg-slate-800 text-slate-500'
              )}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('h-0.5 flex-1 rounded-full transition-colors', done ? 'bg-[#B01817]' : 'bg-slate-800')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── OrderCard ────────────────────────────────────────────────────────────────
function OrderCard({ order, onCancel, isCancelling }: { order: Order; onCancel: (id: string) => void; isCancelling: boolean }) {
  const cfg = STATUS_CONFIG[order.status];
  const Icon = cfg.icon;
  const cancellable = order.status === 'en_attente';

  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-4 space-y-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Commande #{order.id.slice(0, 8)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(order.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <span className={cn('flex items-center gap-1 text-xs font-semibold', cfg.color)}>
          <Icon className="size-3.5" />
          {cfg.label}
        </span>
      </div>

      <div className="space-y-1">
        {order.items.map((line) => (
          <div key={line.id} className="flex justify-between text-xs">
            <span className="text-muted-foreground">{line.menu_item.name} × {line.quantity}</span>
            <span>{(line.unit_price * line.quantity).toFixed(2)} MAD</span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[#B01817]">{order.total.toFixed(2)} MAD</span>
        {cancellable && (
          <Button
            size="sm"
            variant="outline"
            disabled={isCancelling}
            onClick={() => onCancel(order.id)}
            className="h-7 text-xs gap-1 border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <XCircle className="size-3.5" />
            Annuler
          </Button>
        )}
      </div>

      <OrderStepper status={order.status} />
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function EatsPage() {
  const queryClient = useQueryClient();
  const { items: cart, addItem, updateQty, clearCart } = useCartStore();

  // Menu
  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => getMenuItems(),
  });

  // My orders — poll every 15s for status updates
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => getMyOrders(),
    refetchInterval: 15_000,
  });

  // Place order
  const orderMutation = useMutation({
    mutationFn: () =>
      createOrder(cart.map((c) => ({ menu_item_id: c.item.id, quantity: c.qty }))),
    onSuccess: () => {
      clearCart();
      toast.success('Commande passée avec succès !');
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
    onError: () => toast.error('Erreur lors de la commande.'),
  });

  // Cancel order
  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: () => {
      toast.success('Commande annulée.');
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
    onError: () => toast.error('Impossible d\'annuler la commande.'),
  });

  // MenuItemController returns a raw array (no wrapper, no paginator)
  const rawMenu: any[] = Array.isArray(menuData?.data) ? menuData.data : (menuData?.data?.data ?? []);
  const menuItems: MenuItem[] = rawMenu.map((m: any) => ({
    ...m,
    name:      m.name      ?? m.nomPlat       ?? '',
    price:     m.price     ?? m.prix          ?? 0,
    category:  m.category  ?? m.categorie     ?? '',
    available: m.available ?? m.estDisponible ?? false,
  }));

  // OrderController returns raw array (no wrapper)
  const rawOrders: any[] = Array.isArray(ordersData?.data) ? ordersData.data : (ordersData?.data?.data ?? []);
  const myOrders: Order[] = rawOrders.map((o: any) => ({
    ...o,
    status: (() => {
      const s: string = o.status ?? o.statut ?? '';
      const map: Record<string, string> = {
        EnAttente: 'en_attente', en_attente: 'en_attente',
        EnPreparation: 'en_preparation', en_preparation: 'en_preparation',
        Prete: 'pret', pret: 'pret',
        Recuperee: 'livre', livre: 'livre',
        Annulee: 'annule', annule: 'annule',
      };
      return (map[s] ?? 'en_attente') as Order['status'];
    })(),
    total: o.total ?? 0,
    items: o.items ?? o.lignes ?? [],
  }));
  const itemCount = cart.reduce((s, c) => s + c.qty, 0);
  const total = cart.reduce((s, c) => s + (c.item.price ?? c.item.prix ?? 0) * c.qty, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Tabs defaultValue="menu">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <UtensilsCrossed className="size-4 text-[#B01817]" />
            ENSIAS Eats
          </h2>
          <TabsList className="h-8">
            <TabsTrigger value="menu" className="text-xs h-7 gap-1.5">
              <UtensilsCrossed className="size-3.5" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs h-7 gap-1.5">
              <ClipboardList className="size-3.5" />
              Ma commande
              {myOrders.filter((o) => o.status !== 'livre' && o.status !== 'annule').length > 0 && (
                <Badge className="ml-0.5 bg-[#B01817] text-white text-[10px] px-1 h-4">
                  {myOrders.filter((o) => o.status !== 'livre' && o.status !== 'annule').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── TAB: MENU ── */}
        <TabsContent value="menu">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            {/* Menu grid */}
            <div>
              {menuLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
                </div>
              ) : menuItems.length === 0 ? (
                <EmptyState icon={UtensilsCrossed} title="Aucun article disponible" />
              ) : (
                <AnimatedList className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {menuItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAdd={(i) => { addItem(i); toast.success(`${i.name ?? i.nomPlat} ajouté`); }}
                    />
                  ))}
                </AnimatedList>
              )}
            </div>

            {/* Cart */}
            <aside className="lg:sticky lg:top-20 h-fit space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ShoppingCart className="size-4" />
                Panier
                {itemCount > 0 && (
                  <Badge className="ml-auto bg-[#B01817] text-white text-xs">{itemCount}</Badge>
                )}
              </h3>

              <div className="rounded-xl border border-border bg-card p-4 min-h-[160px]">
                <AnimatePresence mode="popLayout">
                  {cart.length === 0 ? (
                    <motion.p
                      key="empty"
                      className="text-xs text-muted-foreground text-center py-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Votre panier est vide
                    </motion.p>
                  ) : (
                    <motion.div key="items" className="space-y-3">
                      {cart.map((c) => (
                        <motion.div
                          key={c.item.id}
                          className="flex items-center gap-2"
                          layout
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{c.item.name ?? c.item.nomPlat}</p>
                            <p className="text-xs text-muted-foreground">
                              {((c.item.price ?? c.item.prix ?? 0) * c.qty).toFixed(2)} MAD
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="size-6" onClick={() => updateQty(c.item.id, -1)}>
                              {c.qty === 1 ? <Trash2 className="size-3 text-destructive" /> : <Minus className="size-3" />}
                            </Button>
                            <span className="text-xs font-semibold w-4 text-center">{c.qty}</span>
                            <Button variant="ghost" size="icon" className="size-6" onClick={() => updateQty(c.item.id, 1)}>
                              <Plus className="size-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}

                      <Separator />
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total</span>
                        <span className="text-[#B01817]">{total.toFixed(2)} MAD</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button
                className="w-full bg-[#B01817] hover:bg-[#8f1211] text-white gap-2"
                disabled={cart.length === 0 || orderMutation.isPending}
                onClick={() => orderMutation.mutate()}
              >
                {orderMutation.isPending ? (
                  <><RefreshCw className="size-4 animate-spin" />Envoi…</>
                ) : (
                  <><ShoppingCart className="size-4" />Commander · {total.toFixed(2)} MAD</>
                )}
              </Button>
            </aside>
          </div>
        </TabsContent>

        {/* ── TAB: MY ORDERS ── */}
        <TabsContent value="orders">
          {ordersLoading ? (
            <div className="space-y-4 max-w-lg">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          ) : myOrders.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Aucune commande"
              description="Passez votre première commande depuis l'onglet Menu."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancel={(id) => cancelMutation.mutate(id)}
                  isCancelling={cancelMutation.isPending}
                />
              ))}
            </div>
          )}

          {/* Polling indicator */}
          <p className="mt-6 text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <RefreshCw className="size-3" />
            Statut actualisé toutes les 15 secondes
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
