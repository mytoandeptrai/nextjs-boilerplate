import { useQuery } from '@tanstack/react-query';
import { useServices } from '@/services';

export function useItem1List({
  pageIndex,
  pageSize,
  name,
  sort,
}: {
  pageIndex: number;
  pageSize: number;
  name: string;
  sort?: string[];
}) {
  const { Item1Service } = useServices();

  return useQuery({
    queryKey: ['item1s', pageIndex, pageSize, name, sort],
    queryFn: () =>
      Item1Service.find({
        page: pageIndex + 1,
        limit: pageSize,
        name: name,
        sort: sort,
      }),
  });
}
