import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { CONFIGURATOR_LIMITS, STORAGE_KEYS } from '@/constants/const';
import type { ICartItem } from '@/types/catalog';

export interface ICartStore {
  items: ICartItem[];
  /** Drawer visibility. Not persisted. */
  isOpen: boolean;
  addItem: (item: ICartItem) => void;
  /** Replace a line (used when prices are re-validated against the database). */
  replaceItem: (item: ICartItem) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

const CART_VERSION = 1;

const clampQuantity = (quantity: number) =>
  Math.min(CONFIGURATOR_LIMITS.quantity.max, Math.max(CONFIGURATOR_LIMITS.quantity.min, Math.round(quantity)));

/** Same product, size and options: one line with a higher quantity instead of two lines. */
const isSameConfiguration = (a: ICartItem, b: ICartItem) =>
  a.productId === b.productId &&
  a.widthCm === b.widthCm &&
  a.heightCm === b.heightCm &&
  a.pleatId === b.pleatId &&
  a.fullness === b.fullness &&
  a.fabricId === b.fabricId &&
  a.motorId === b.motorId;

const isCartItem = (value: unknown): value is ICartItem => {
  const item = value as Partial<ICartItem> | null;

  return Boolean(
    item &&
      typeof item.id === 'string' &&
      typeof item.productId === 'string' &&
      typeof item.title === 'string' &&
      typeof item.widthCm === 'number' &&
      typeof item.heightCm === 'number' &&
      typeof item.quantity === 'number' &&
      typeof item.unitPrice === 'number'
  );
};

export const useCartStore = create<ICartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((line) => isSameConfiguration(line, item));

          if (!existing) return { items: [...state.items, item] };

          return {
            items: state.items.map((line) =>
              line.id === existing.id
                ? { ...line, unitPrice: item.unitPrice, quantity: clampQuantity(line.quantity + item.quantity) }
                : line
            ),
          };
        }),
      replaceItem: (item) =>
        set((state) => ({ items: state.items.map((line) => (line.id === item.id ? item : line)) })),
      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((line) => (line.id === id ? { ...line, quantity: clampQuantity(quantity) } : line)),
        })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((line) => line.id !== id) })),
      clear: () => set({ items: [] }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: STORAGE_KEYS.CART,
      version: CART_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      // Hydrate after mount (see `useCartHydration`), so the server and the first client render match.
      skipHydration: true,
      // An older or corrupt cart is dropped line by line instead of breaking the page.
      migrate: (persisted) => ({
        items: ((persisted as { items?: unknown[] } | null)?.items ?? []).filter(isCartItem),
      }),
      merge: (persisted, current) => ({
        ...current,
        items: ((persisted as { items?: unknown[] } | null)?.items ?? []).filter(isCartItem),
      }),
    }
  )
);

export const selectCartCount = (state: ICartStore) => state.items.reduce((count, line) => count + line.quantity, 0);
export const selectCartTotal = (state: ICartStore) =>
  state.items.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
