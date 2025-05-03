import { useMutation } from '@tanstack/react-query';
import { useServices } from '@/services';

export function useDeleteItem1Mutation() {
  const { Item1Service } = useServices();

  return useMutation({
    mutationKey: ['delete-item1'],
    mutationFn: Item1Service.delete,
  });
}
