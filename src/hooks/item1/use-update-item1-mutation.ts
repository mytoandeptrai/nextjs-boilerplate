import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServices } from '@/services';

export function useUpdateItem1Mutation() {
  const { Item1Service } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['update-item1'],
    mutationFn: Item1Service.update,
    onSuccess: (_, variables) => {
      // Invalidate the instructor detail query
      queryClient.invalidateQueries({ queryKey: ['item1', variables.id] });
      // Also invalidate the instructors list query
      queryClient.invalidateQueries({ queryKey: ['item1s'] });
    },
  });
}
