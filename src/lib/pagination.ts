/** A page number from a `?page=` value: whole numbers from 1 up, anything else is the first page. */
export const parsePage = (value: unknown): number => {
  const page = typeof value === 'string' && /^\d{1,6}$/.test(value) ? Number(value) : 1;

  return Math.max(1, page);
};

export const getTotalPages = (total: number, pageSize: number) => Math.max(1, Math.ceil(total / pageSize));

/**
 * Page numbers to link to: the first and last page, the current one and its neighbours, with `null` where
 * pages are left out (1 … 4 5 6 … 12).
 */
export const getPageItems = (page: number, totalPages: number): (number | null)[] => {
  const shown = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);

  return shown.flatMap((item, index) => {
    const gap = item - (shown[index - 1] ?? 0);

    // A gap of one page is filled with that page instead of an ellipsis.
    if (gap === 2) return [item - 1, item];

    return gap > 2 ? [null, item] : [item];
  });
};
