import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { IBlogPost } from '@/types/catalog';
import type { IApiError } from '@/types/type';
import { ADMIN_POST_KEYS } from './keys';
import { createAdminPostRequest, deleteAdminPostRequest, updateAdminPostRequest } from './requests';
import type { PostBody } from './schema';

export const useCreateAdminPostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<IBlogPost, IApiError, PostBody>({
    mutationFn: createAdminPostRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_POST_KEYS.list }),
  });
};

export const useUpdateAdminPostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<IBlogPost, IApiError, { id: string; body: PostBody }>({
    mutationFn: updateAdminPostRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_POST_KEYS.list }),
  });
};

export const useDeleteAdminPostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, IApiError, string>({
    mutationFn: deleteAdminPostRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_POST_KEYS.list }),
  });
};
