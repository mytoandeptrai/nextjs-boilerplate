'use client';

import { createContext, type ReactNode, use, useEffect, useMemo, useState } from 'react';

import { useCartStore } from '@/stores';

interface IStoreContext {
  /** Zalo number configured by the admin; empty when the Zalo button is turned off. */
  zaloHotline: string;
  /** `false` until the cart was read from `localStorage` (the server render never has it). */
  isCartReady: boolean;
}

const StoreContext = createContext<IStoreContext>({ zaloHotline: '', isCartReady: false });

export const useStore = () => use(StoreContext);

export function StoreProvider({ zaloHotline, children }: { zaloHotline: string; children: ReactNode }) {
  const [isCartReady, setIsCartReady] = useState(false);

  useEffect(() => {
    // The store skips automatic hydration so the first client render matches the server (an empty cart).
    Promise.resolve(useCartStore.persist.rehydrate()).finally(() => setIsCartReady(true));

    // Keep several tabs in sync.
    const onStorage = (event: StorageEvent) => {
      if (event.key === useCartStore.persist.getOptions().name) useCartStore.persist.rehydrate();
    };

    window.addEventListener('storage', onStorage);

    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(() => ({ zaloHotline, isCartReady }), [zaloHotline, isCartReady]);

  return <StoreContext value={value}>{children}</StoreContext>;
}
