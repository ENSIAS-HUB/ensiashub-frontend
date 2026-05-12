import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  mealId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface EatsStore {
  cart: CartItem[];
  addToCart: (meal: CartItem) => void;
  removeFromCart: (mealId: string) => void;
  updateQuantity: (mealId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useEatsStore = create<EatsStore>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (meal) =>
        set((state) => {
          const existing = state.cart.find((c) => c.mealId === meal.mealId);
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.mealId === meal.mealId ? { ...c, quantity: c.quantity + 1 } : c
              ),
            };
          }
          return { cart: [...state.cart, { ...meal, quantity: 1 }] };
        }),

      removeFromCart: (mealId) =>
        set((state) => ({ cart: state.cart.filter((c) => c.mealId !== mealId) })),

      updateQuantity: (mealId, quantity) =>
        set((state) => ({
          cart: quantity <= 0
            ? state.cart.filter((c) => c.mealId !== mealId)
            : state.cart.map((c) => (c.mealId === mealId ? { ...c, quantity } : c)),
        })),

      clearCart: () => set({ cart: [] }),

      total: () =>
        get().cart.reduce((sum, c) => sum + c.price * c.quantity, 0),

      itemCount: () =>
        get().cart.reduce((sum, c) => sum + c.quantity, 0),
    }),
    { name: 'ensias-eats-cart' }
  )
);
