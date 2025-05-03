import type { PaginatedListResponse } from '@/types/common';
import type { PaginationState } from '@tanstack/react-table';

export function transformPaginatedList<T, TOut = T>(
  data: PaginatedListResponse<T>,
  transform: (item: T) => TOut = (item) => item as unknown as TOut
): {
  items: TOut[];
  meta: PaginatedListResponse<T>['meta'] & {
    nextPage: number | undefined;
  };
} {
  return {
    items: data.items.map(transform),
    meta: {
      ...data.meta,
      nextPage: data.meta.current_page < data.meta.total_pages ? data.meta.current_page + 1 : undefined,
    },
  };
}

export function transformMetaToPaginationState(meta?: PaginatedListResponse<unknown>['meta']): PaginationState {
  if (!meta) {
    return {
      pageIndex: 0,
      pageSize: 0,
    };
  }
  return {
    pageIndex: meta.current_page - 1,
    pageSize: meta.per_page,
  };
}
