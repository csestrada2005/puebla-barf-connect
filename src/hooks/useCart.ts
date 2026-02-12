import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SubscriptionDetails {
  planType: "monthly" | "annual";
  proteinLine: string;
  presentation: string;
  frequency: string;
  weeklyKg?: number;
  discountPercent: number;
  dogName?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isSubscription?: boolean;
  imageUrl?: string;
  subscriptionDetails?: SubscriptionDetails;
  /** Number of individual packs in this bundle (7 or 14). Display only – price already reflects total. */
  packSize?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          // For subscriptions, replace any existing subscription
          if (item.isSubscription) {
            const nonSubItems = state.items.filter((i) => !i.isSubscription);
            return { items: [...nonSubItems, { ...item, quantity: 1 }] };
          }
          
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: "rawpaw-cart",
    }
  )
);