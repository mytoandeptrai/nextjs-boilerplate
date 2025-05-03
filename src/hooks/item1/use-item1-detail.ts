import { useQuery } from '@tanstack/react-query';
import { useServices } from '@/services';

export function useItem1Detail(id: string) {
  const { Item1Service } = useServices();

  return useQuery({
    queryKey: ['item1', id],
    queryFn: () => Item1Service.get(id),
  });
}
