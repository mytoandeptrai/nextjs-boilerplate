import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { IProduct } from '@/types/catalog';
import type { IApiError } from '@/types/type';
import { ADMIN_PRODUCT_KEYS } from './keys';
import { createAdminProductRequest, deleteAdminProductRequest, updateAdminProductRequest } from './requests';
import type { ProductBody } from './schema';

export const useCreateAdminProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<IProduct, IApiError, ProductBody>({
    mutationFn: createAdminProductRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCT_KEYS.list }),
  });
};

export const useUpdateAdminProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<IProduct, IApiError, { id: string; body: ProductBody }>({
    mutationFn: updateAdminProductRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCT_KEYS.list }),
  });
};

export const useDeleteAdminProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, IApiError, string>({
    mutationFn: deleteAdminProductRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCT_KEYS.list }),
  });
};
