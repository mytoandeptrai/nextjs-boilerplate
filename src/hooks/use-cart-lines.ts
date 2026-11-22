'use client';

import { useEffect, useMemo } from 'react';

import { useProductsByIdsQuery } from '@/api/catalog/queries';
import { toCartItem } from '@/lib/quote';
import { useCartStore } from '@/stores';
import type { ICartItem, IProduct } from '@/types/catalog';

export interface ICartLine {
  item: ICartItem;
  /** Current product, `null` when it was deleted or hidden (or while it is still loading). */
  product: IProduct | null;
  /** `false` only once the catalogue answered and the product is not in it. */
  isAvailable: boolean;
}

/**
 * Cart lines checked against the current catalogue: prices that changed since the item was added are corrected in
 * the store, and products that are gone are flagged so the customer can remove them before sending the request.
 */
export const useCartLines = (enabled = true) => {
  const items = useCartStore((state) => state.items);
  const replaceItem = useCartStore((state) => state.replaceItem);
  const productIds = useMemo(() => [...new Set(items.map((item) => item.productId))], [items]);
  const { data: products, isFetching, isSuccess } = useProductsByIdsQuery(productIds, enabled);

  const lines = useMemo<ICartLine[]>(() => {
    const byId = new Map((products ?? []).map((product) => [product.id, product]));

    return items.map((item) => {
      const product = byId.get(item.productId) ?? null;

      return { item, product, isAvailable: !isSuccess || Boolean(product) };
    });
  }, [items, products, isSuccess]);

  useEffect(() => {
    for (const { item, product } of lines) {
      if (!product) continue;

      const fresh = toCartItem(product, item, item.id);

      if (fresh && (fresh.unitPrice !== item.unitPrice || fresh.title !== item.title || fresh.image !== item.image))
        replaceItem(fresh);
    }
  }, [lines, replaceItem]);

  return {
    lines,
    total: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    hasUnavailable: lines.some((line) => !line.isAvailable),
    isValidating: isFetching,
  };
};
