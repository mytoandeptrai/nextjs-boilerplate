import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { IApiError } from '@/types/type';
import { item1QueryKeys } from './keys';
import { createItem1Request, deleteItem1Request, updateItem1Request } from './requests';
import type { ICreateItem1Body, IItem1, IUpdateItem1Body } from './type';

export const useCreateItem1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation<IItem1, IApiError, ICreateItem1Body>({
    mutationKey: ['create-item1'],
    mutationFn: createItem1Request,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: item1QueryKeys.all }),
  });
};

export const useUpdateItem1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation<IItem1, IApiError, IUpdateItem1Body>({
    mutationKey: ['update-item1'],
    mutationFn: updateItem1Request,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: item1QueryKeys.all }),
  });
};

export const useDeleteItem1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, IApiError, string>({
    mutationKey: ['delete-item1'],
    mutationFn: deleteItem1Request,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: item1QueryKeys.all }),
  });
};
