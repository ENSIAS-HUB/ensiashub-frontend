'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { AnimatedList } from '@/components/common/AnimatedList';
import { getMenuItems, createOrder } from '@/lib/api/eats';
import type { MenuItem } from '@/lib/types';
import { toast } from 'sonner';

interface CartItem {
  item: MenuItem;
  qty: number;
}

function MenuItemCard({
  item,
  onAdd,
}: {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}) {
  return (
    <motion.div
      className={`rounded-xl border bg-card p-4 space-y-3 ${item.available ? 'border-border hover:border-[#B01817]/20' : 'border-border opacity-50'}`}
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
          <span className="text-sm font-bold text-[#B01817]">{item.price.toFixed(2)} MAD</span>
        </div>
      </div>

      <Button
        size="sm"
        className="w-full h-8 text-xs bg-[#B01817] hover:bg-[#D42B2A] text-white"
        disabled={!item.available}
        onClick={() => onAdd(item)}
      >
        <Plus className="size-3.5 mr-1.5" />
        {item.available ? 'Ajouter' : 'Non disponible'}
      </Button>
    </motion.div>
  );
}

export default function EatsPage() {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => getMenuItems(),
  });

  const orderMutation = useMutation({
    mutationFn: () =>
      createOrder(cart.map((c) => ({ menu_item_id: c.item.id, quantity: c.qty }))),
    onSuccess: () => {
      setCart([]);
      toast.success('Commande passée avec succès !');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: () => toast.error('Erreur lors de la commande.'),
  });

  const items = data?.data.data ?? [];

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) return prev.map((c) => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { item, qty: 1 }];
    });
    toast.success(`${item.name} ajouté au panier`);
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => c.item.id === itemId ? { ...c, qty: c.qty + delta } : c)
        .filter((c) => c.qty > 0)
    );
  };

  const total = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
  const itemCount = cart.reduce((sum, c) => sum + c.qty, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      {/* Menu column */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <UtensilsCrossed className="size-4 text-[#B01817]" />
          Menu du jour
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={UtensilsCrossed} title="Aucun article disponible" />
        ) : (
          <AnimatedList className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {items.map((item) => <MenuItemCard key={item.id} item={item} onAdd={addToCart} />)}
          </AnimatedList>
        )}
      </div>

      {/* Cart column */}
      <aside className="lg:sticky lg:top-20 space-y-3 h-fit">
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
                      <p className="text-xs font-medium truncate">{c.item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(c.item.price * c.qty).toFixed(2)} MAD
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => updateQty(c.item.id, -1)}
                      >
                        {c.qty === 1 ? <Trash2 className="size-3 text-destructive" /> : <Minus className="size-3" />}
                      </Button>
                      <span className="text-xs font-semibold w-4 text-center">{c.qty}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => updateQty(c.item.id, 1)}
                      >
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

        {cart.length > 0 && (
          <Button
            className="w-full bg-[#B01817] hover:bg-[#D42B2A] text-white font-medium"
            onClick={() => orderMutation.mutate()}
            disabled={orderMutation.isPending}
          >
            {orderMutation.isPending ? 'Commande en cours…' : 'Passer la commande'}
          </Button>
        )}
      </aside>
    </div>
  );
}
