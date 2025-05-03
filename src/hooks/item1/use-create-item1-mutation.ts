import { useServices } from '@/services';
import { useMutation } from '@tanstack/react-query';

export function useCreateItem1Mutation() {
  const { Item1Service } = useServices();

  return useMutation({
    mutationKey: ['create-item1'],
    mutationFn: Item1Service.create,
  });
}
