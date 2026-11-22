import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ILookbook } from '@/types/catalog';
import type { IApiError } from '@/types/type';
import { ADMIN_LOOKBOOK_KEYS } from './keys';
import { createAdminLookbookRequest, deleteAdminLookbookRequest, updateAdminLookbookRequest } from './requests';
import type { LookbookBody } from './schema';

export const useCreateAdminLookbookMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ILookbook, IApiError, LookbookBody>({
    mutationFn: createAdminLookbookRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_LOOKBOOK_KEYS.list }),
  });
};

export const useUpdateAdminLookbookMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ILookbook, IApiError, { id: string; body: LookbookBody }>({
    mutationFn: updateAdminLookbookRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_LOOKBOOK_KEYS.list }),
  });
};

export const useDeleteAdminLookbookMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, IApiError, string>({
    mutationFn: deleteAdminLookbookRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_LOOKBOOK_KEYS.list }),
  });
};
