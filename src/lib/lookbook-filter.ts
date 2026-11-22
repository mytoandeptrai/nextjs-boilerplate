import type { ICategory, ILookbook } from '@/types/catalog';

/** `?category=` value for photos without a category. A real category with this slug wins. */
export const UNCATEGORISED_SLUG = 'khac';

export interface ILookbookFilter {
  /** Categories that have at least one photo, in display order. */
  categories: ICategory[];
  /** Whether an "Other" chip is needed for photos outside those categories. */
  hasUncategorised: boolean;
  active: ICategory | null;
  isUncategorisedActive: boolean;
  lookbooks: ILookbook[];
}

/**
 * Narrows the gallery to one category. Only categories with photos are offered, so no chip leads to an
 * empty gallery, and an unknown slug shows everything.
 */
export const filterLookbooks = (lookbooks: ILookbook[], categories: ICategory[], slug?: string): ILookbookFilter => {
  const used = categories.filter((category) => lookbooks.some((lookbook) => lookbook.category_id === category.id));
  const usedIds = new Set(used.map((category) => category.id));
  const isUncategorised = (lookbook: ILookbook) => !lookbook.category_id || !usedIds.has(lookbook.category_id);
  const hasUncategorised = used.length > 0 && lookbooks.some(isUncategorised);
  const active = used.find((category) => category.slug === slug) ?? null;
  const isUncategorisedActive = !active && hasUncategorised && slug === UNCATEGORISED_SLUG;

  return {
    categories: used,
    hasUncategorised,
    active,
    isUncategorisedActive,
    lookbooks: lookbooks.filter((lookbook) => {
      if (active) return lookbook.category_id === active.id;

      return !isUncategorisedActive || isUncategorised(lookbook);
    }),
  };
};
