import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem } from '@/lib/types';

export interface CartItem {
  item: MenuItem;
  qty: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQty: (itemId: string, delta: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((c) => c.item.id === item.id);
          if (existing) {
            return {
              items: state.items.map((c) =>
                c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c
              ),
            };
          }
          return { items: [...state.items, { item, qty: 1 }] };
        }),
      removeItem: (itemId) =>
        set((state) => ({ items: state.items.filter((c) => c.item.id !== itemId) })),
      updateQty: (itemId, delta) =>
        set((state) => ({
          items: state.items
            .map((c) => (c.item.id === itemId ? { ...c, qty: c.qty + delta } : c))
            .filter((c) => c.qty > 0),
        })),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'ensias-hub-cart' }
  )
);
