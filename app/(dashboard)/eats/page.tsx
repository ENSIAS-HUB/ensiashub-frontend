'use client';

import { useState } from 'react';
import type { ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UtensilsCrossed, ClipboardList, ShoppingCart, Plus, Minus, Trash2,
  RefreshCw, Clock, ChefHat, PackageCheck, CheckCircle2, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getMeals, createOrder, getMyOrders, cancelOrder } from '@/lib/api/eats';
import type { EatsMeal, EatsOrder } from '@/lib/api/eats';
import { useEatsStore } from '@/lib/store/eatsStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Tab = 'menu' | 'orders';
type OrderStatus = EatsOrder['status'];

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string; badgeClass: string; icon: ElementType }> = {
  en_attente:     { label: 'En attente',     badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
  en_preparation: { label: 'En préparation', badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',       icon: ChefHat },
  pret:           { label: 'Prêt',           badgeClass: 'bg-green-500/20 text-green-400 border-green-500/30',    icon: PackageCheck },
  livre:          { label: 'Livré',          badgeClass: 'bg-slate-500/20 text-slate-400 border-slate-500/30',    icon: CheckCircle2 },
  annule:         { label: 'Annulé',         badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',          icon: XCircle },
};

// ── MenuItemRow ───────────────────────────────────────────────────────────────
function MenuItemRow({ meal, onAdd }: { meal: EatsMeal; onAdd: (meal: EatsMeal) => void }) {
  const qty = useEatsStore(s => s.cart.find(c => c.mealId === meal.id)?.quantity ?? 0);

  return (
    <motion.div
      className={cn(
        'group flex items-center gap-4 py-3 px-4',
        'border-b border-border/50 last:border-0',
        'transition-colors duration-150',
        meal.available ? 'hover:bg-white/[0.02]' : 'opacity-50',
      )}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 size-20 rounded-xl overflow-hidden bg-muted">
        {meal.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={meal.image_url}
            alt={meal.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="size-5 text-muted-foreground/25" />
          </div>
        )}
        {qty > 0 && (
          <div className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-[#B01817] text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(176,24,23,0.6)] z-10">
            {qty}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={cn(
              'text-sm font-semibold leading-tight',
              !meal.available && 'line-through text-muted-foreground',
            )}>
              {meal.name}
            </p>
            {meal.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">
                {meal.description}
              </p>
            )}
            <p className="text-sm font-bold mt-1.5">
              {meal.price != null ? meal.price.toFixed(2) : '—'}
              <span className="text-[11px] font-normal text-muted-foreground/70 ml-1">MAD</span>
            </p>
          </div>

          {/* Add button */}
          <button
            disabled={!meal.available}
            onClick={() => onAdd(meal)}
            className={cn(
              'shrink-0 flex size-7 items-center justify-center rounded-lg border transition-all duration-150',
              meal.available
                ? qty > 0
                  ? 'bg-[#B01817]/15 border-[#B01817]/60 text-[#B01817]'
                  : 'border-border/60 text-muted-foreground/50 hover:border-[#B01817]/50 hover:text-[#B01817] hover:bg-[#B01817]/[0.08]'
                : 'border-border/30 text-muted-foreground/20 cursor-not-allowed',
            )}
          >
            <Plus className="size-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── OrderRow ──────────────────────────────────────────────────────────────────
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
    onError: () => toast.error("Impossible d'annuler la commande."),
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Commande #{order.id.slice(0, 8)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(order.created_at).toLocaleString('fr-FR', {
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
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
        {/* FIX 7 — total NOT red */}
        <span className="text-sm font-bold">{order.total.toFixed(2)} MAD</span>
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EatsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('menu');

  const queryClient = useQueryClient();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount } = useEatsStore();

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: mealsData, isLoading: mealsLoading } = useQuery({
    queryKey: ['eats-meals'],
    queryFn: () => getMeals(),
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['eats-my-orders'],
    queryFn: () => getMyOrders(),
    refetchInterval: 15_000,
  });

  // ── Data mapping (unchanged) ──────────────────────────────────────────────
  const menuItems: EatsMeal[] = Array.isArray(mealsData?.data?.data)
    ? mealsData.data.data
    : Array.isArray(mealsData?.data)
    ? (mealsData.data as unknown as EatsMeal[])
    : [];

  const myOrders: EatsOrder[] = Array.isArray(ordersData?.data?.data)
    ? ordersData.data.data
    : Array.isArray(ordersData?.data)
    ? (ordersData.data as unknown as EatsOrder[])
    : [];


  const cartTotal = total();
  const cartCount = itemCount();
  const activeOrdersCount = myOrders.filter(o => o.status !== 'livre' && o.status !== 'annule').length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddToCart = (meal: EatsMeal) =>
    addToCart({ mealId: meal.id, name: meal.name, price: meal.price, quantity: 1, image: meal.image_url });

  const handleUpdateQty = (mealId: string, delta: number) => {
    const item = cart.find(c => c.mealId === mealId);
    if (!item) return;
    const next = item.quantity + delta;
    if (next <= 0) removeFromCart(mealId);
    else updateQuantity(mealId, next);
  };

  // ── Order mutation (unchanged) ────────────────────────────────────────────
  const orderMutation = useMutation({
    mutationFn: () =>
      createOrder({ items: cart.map(i => ({ mealId: i.mealId, quantity: i.quantity })) }),
    onSuccess: () => {
      clearCart();
      toast.success('Commande passée !');
      queryClient.invalidateQueries({ queryKey: ['eats-my-orders'] });
      setActiveTab('orders');
    },
    onError: () => toast.error('Erreur lors de la commande.'),
  });

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as Tab)}
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
      >
        {/* FIX 6 — Page header */}
        <div className="px-6 pt-6 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <UtensilsCrossed className="size-5 text-[#B01817]" />
                ENSIAS Eats
              </h2>
              {/* FIX 5 — Cafeteria status banner */}
              <div className="flex items-center gap-4 mt-1 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
                  <span className="text-xs text-emerald-400 font-medium">Ouvert</span>
                </div>
                <span className="text-xs text-muted-foreground">· Ferme à 15h00</span>
              </div>
            </div>
            <TabsList className="h-8 shrink-0">
              <TabsTrigger value="menu" className="text-xs h-7 gap-1.5">
                <UtensilsCrossed className="size-3.5" />
                Menu
              </TabsTrigger>
              <TabsTrigger value="orders" className="text-xs h-7 gap-1.5">
                <ClipboardList className="size-3.5" />
                Ma commande
                {activeOrdersCount > 0 && (
                  <Badge className="ml-0.5 bg-[#B01817] text-white text-[10px] px-1 h-4">
                    {activeOrdersCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* ── Menu tab ───────────────────────────────────────────────────── */}
        <TabsContent value="menu" className="flex-1 overflow-y-auto px-6 pb-6 mt-0">
          {mealsLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, si) => (
                <div key={si} className="space-y-3">
                  <Skeleton className="h-4 w-32 rounded-full" />
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-3">
                      <Skeleton className="size-16 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3.5 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : menuItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <UtensilsCrossed className="size-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Aucun plat disponible</p>
            </div>
          ) : (() => {
            // Build ordered category map
            const categoryMap = new Map<string, EatsMeal[]>();
            menuItems.forEach((item) => {
              const cat = item.category || 'Autres';
              if (!categoryMap.has(cat)) categoryMap.set(cat, []);
              categoryMap.get(cat)!.push(item);
            });
            const categoryEntries = Array.from(categoryMap.entries());

            return (
              <div className="space-y-6">
                {/* Category anchor nav */}
                <div className="relative">
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
                    {categoryEntries.map(([cat, items]) => (
                      <a
                        key={cat}
                        href={`#cat-${cat.replace(/\s+/g, '-')}`}
                        className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-border text-muted-foreground hover:border-[#B01817]/50 hover:text-foreground transition-all duration-150 whitespace-nowrap bg-transparent"
                      >
                        {cat}
                        <span className="ml-1.5 text-[10px] text-muted-foreground/60">
                          {items.length}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Sections */}
                {categoryEntries.map(([cat, items]) => (
                  <div
                    key={cat}
                    id={`cat-${cat.replace(/\s+/g, '-')}`}
                    className="scroll-mt-20"
                  >
                    {/* Section header */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-bold text-foreground">{cat}</h3>
                      <span className="text-[11px] text-muted-foreground/60 font-mono">
                        {items.length} article{items.length > 1 ? 's' : ''}
                      </span>
                      <div className="flex-1 h-px bg-border/50" />
                    </div>

                    {/* Items list */}
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                      {items.map((meal) => (
                        <MenuItemRow
                          key={meal.id}
                          meal={meal}
                          onAdd={handleAddToCart}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </TabsContent>

        {/* ── Orders tab ─────────────────────────────────────────────────── */}
        <TabsContent value="orders" className="flex-1 overflow-y-auto px-6 pb-6 mt-0">
          <p className="text-[11px] text-muted-foreground/50 font-mono mb-4">
            Actualisé toutes les 15s
          </p>

          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : myOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <ClipboardList className="size-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Aucune commande</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── FIX 4 — Cart sidebar (sticky elevated panel) ─────────────────── */}
      {activeTab === 'menu' && (
        <aside className="w-80 shrink-0 p-4 border-l border-border overflow-y-auto">
          <div className="rounded-xl border border-border bg-card overflow-hidden">

            {/* Cart header */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <ShoppingCart className="size-4 text-[#B01817]" />
              <span className="text-sm font-semibold">Panier</span>
              {cartCount > 0 && (
                <Badge className="ml-auto bg-[#B01817] text-white text-[10px] tabular-nums min-w-[20px] flex items-center justify-center">
                  {cartCount}
                </Badge>
              )}
            </div>

            {/* Cart body */}
            <div className="p-4 min-h-[160px]">
              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <motion.div
                    key="empty"
                    className="flex flex-col items-center justify-center gap-3 py-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                      <ShoppingCart className="size-5 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Panier vide</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                        Ajoutez des plats au menu
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="items" className="space-y-3">
                    {cart.map((c) => (
                      <motion.div
                        key={c.mealId}
                        className="flex items-center gap-2"
                        layout
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{c.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {(c.price * c.quantity).toFixed(2)} MAD
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 rounded-md hover:bg-muted"
                            onClick={() => handleUpdateQty(c.mealId, -1)}
                          >
                            {c.quantity === 1
                              ? <Trash2 className="size-3 text-destructive" />
                              : <Minus className="size-3" />}
                          </Button>
                          <span className="text-xs font-bold w-5 text-center tabular-nums">
                            {c.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 rounded-md hover:bg-muted"
                            onClick={() => handleUpdateQty(c.mealId, 1)}
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}

                    <Separator className="my-2" />

                    {/* FIX 2 — subtotal NOT red */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{cartCount} article{cartCount > 1 ? 's' : ''}</span>
                        <span>{cartTotal.toFixed(2)} MAD</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span>Total</span>
                        <span>{cartTotal.toFixed(2)} MAD</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Commander button — only visible when cart has items */}
            {cart.length > 0 && (
              <div className="px-4 pb-4">
                <Button
                  className="w-full bg-[#B01817] hover:bg-[#C41F1E] text-white gap-2 font-semibold
                    shadow-[0_0_0_1px_rgba(176,24,23,0.5),_0_4px_20px_rgba(176,24,23,0.35)]
                    hover:shadow-[0_0_0_1px_#C41F1E,_0_4px_28px_rgba(176,24,23,0.55)]
                    transition-all duration-200"
                  disabled={orderMutation.isPending}
                  onClick={() => orderMutation.mutate()}
                >
                  {orderMutation.isPending ? (
                    <><RefreshCw className="size-4 animate-spin" />Envoi…</>
                  ) : (
                    <><ShoppingCart className="size-4" />Commander · {cartTotal.toFixed(2)} MAD</>
                  )}
                </Button>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

