import { useMutation } from '@tanstack/react-query';
import { useServices } from '@/services';

export function useLoginMutation() {
  const { AuthService } = useServices();

  return useMutation({
    mutationKey: ['login'],
    mutationFn: AuthService.login,
  });
}
