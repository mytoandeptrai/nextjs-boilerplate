import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CATALOG_KEYS } from '@/api/catalog/keys';
import type { ICategory } from '@/types/catalog';
import type { IApiError } from '@/types/type';
import { ADMIN_CATEGORY_KEYS } from './keys';
import { createAdminCategoryRequest, deleteAdminCategoryRequest, updateAdminCategoryRequest } from './requests';
import type { CategoryBody } from './schema';

/** Refresh the admin list and the category options of the product form and product table. */
const useInvalidateCategories = () => {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORY_KEYS.list }),
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.categories }),
    ]);
};

export const useCreateAdminCategoryMutation = () => {
  const invalidate = useInvalidateCategories();

  return useMutation<ICategory, IApiError, CategoryBody>({
    mutationFn: createAdminCategoryRequest,
    onSuccess: invalidate,
  });
};

export const useUpdateAdminCategoryMutation = () => {
  const invalidate = useInvalidateCategories();

  return useMutation<ICategory, IApiError, { id: string; body: CategoryBody }>({
    mutationFn: updateAdminCategoryRequest,
    onSuccess: invalidate,
  });
};

export const useDeleteAdminCategoryMutation = () => {
  const invalidate = useInvalidateCategories();

  return useMutation<void, IApiError, string>({
    mutationFn: deleteAdminCategoryRequest,
    onSuccess: invalidate,
  });
};
