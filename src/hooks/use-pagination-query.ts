import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { DEFAULT_PAGINATION } from '@/constants/const';
import { usePathname, useRouter } from '@/i18n/navigation';

export function usePaginationQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const pageIndex = Number.parseInt(searchParams.get('pageIndex') || '0', 10) || DEFAULT_PAGINATION.pageIndex;
  const pageSize = Number.parseInt(searchParams.get('pageSize') || '10', 10) || DEFAULT_PAGINATION.pageSize;

  const setPagination = useCallback(
    ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
      const params = new URLSearchParams(searchParams);
      params.set('pageIndex', pageIndex.toString());
      params.set('pageSize', pageSize.toString());
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return { pageIndex, pageSize, setPagination };
}
