'use client';

import { ShoppingCart } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEatsStore } from '@/lib/store/eatsStore';
import { createOrder } from '@/lib/api/eats';
import { toast } from 'sonner';

interface CartPanelProps {
  onOrderSuccess: () => void;
}

export function CartPanel({ onOrderSuccess }: CartPanelProps) {
  const queryClient = useQueryClient();
  const { cart, updateQuantity, clearCart, total, itemCount } = useEatsStore();

  const orderMutation = useMutation({
    mutationFn: () =>
      createOrder({
        items: cart.map((i) => ({ mealId: i.mealId, quantity: i.quantity })),
      }),
    onSuccess: () => {
      clearCart();
      toast.success('Commande passée !');
      queryClient.invalidateQueries({ queryKey: ['eats-my-orders'] });
      onOrderSuccess();
    },
    onError: () => toast.error('Erreur lors de la commande.'),
  });

  const count = itemCount();

  return (
    <div className="w-72 shrink-0 flex flex-col border-l border-border bg-card/50 h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <ShoppingCart className="size-4 text-[#B01817]" />
        <span className="text-sm font-semibold">Panier</span>
        {count > 0 && (
          <Badge className="ml-auto bg-[#B01817] text-white text-[10px]">{count}</Badge>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
            <ShoppingCart className="size-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">Votre panier est vide</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.mealId} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.price.toFixed(2)} MAD
                  </p>
                </div>
                {/* Quantity controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.mealId, item.quantity - 1)}
                    className="size-5 rounded border border-border flex items-center justify-center hover:bg-muted text-xs"
                  >
                    −
                  </button>
                  <span className="text-xs w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.mealId, item.quantity + 1)}
                    className="size-5 rounded border border-border flex items-center justify-center hover:bg-muted text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <Button
          className="w-full bg-[#B01817] hover:bg-[#C41F1E] text-white font-semibold gap-2 h-10"
          disabled={cart.length === 0 || orderMutation.isPending}
          onClick={() => orderMutation.mutate()}
        >
          <ShoppingCart className="size-4" />
          Commander · {total().toFixed(2)} MAD
        </Button>
      </div>
    </div>
  );
}
