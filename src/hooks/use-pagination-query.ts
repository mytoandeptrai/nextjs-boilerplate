import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function usePaginationQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageIndex = Number.parseInt(searchParams.get('pageIndex') || '0') || 0;
  const pageSize = Number.parseInt(searchParams.get('pageSize') || '10') || 10;

  const setPagination = useCallback(
    ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
      const params = new URLSearchParams(searchParams);
      params.set('pageIndex', pageIndex.toString());
      params.set('pageSize', pageSize.toString());
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return { pageIndex, pageSize, setPagination };
}
