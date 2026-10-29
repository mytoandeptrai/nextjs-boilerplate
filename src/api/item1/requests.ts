import { buildRoute } from '@/constants/routes';
import type { IPaginatedListResponse } from '@/types/type';
import { transformPaginatedList } from '@/utils/pagination';
import { getApiRequestClient } from '../axios';
import { ITEM1_KEYS } from './keys';
import type { ICreateItem1Body, IGetItem1ListParams, IItem1, IUpdateItem1Body } from './type';

export const getItem1ListRequest = async (params: IGetItem1ListParams) => {
  const { data } = await getApiRequestClient().get<IPaginatedListResponse<IItem1>>(ITEM1_KEYS.ITEM1, {
    params: { ...params, sort: params.sort?.join(',') },
  });

  return transformPaginatedList(data);
};

export const getItem1DetailRequest = async (id: string): Promise<IItem1> => {
  const { data } = await getApiRequestClient().get<IItem1>(buildRoute(ITEM1_KEYS.ITEM1_DETAIL, { id }));

  return data;
};

export const createItem1Request = async (body: ICreateItem1Body): Promise<IItem1> => {
  const { data } = await getApiRequestClient().post<IItem1>(ITEM1_KEYS.ITEM1, body);

  return data;
};

export const updateItem1Request = async ({ id, ...body }: IUpdateItem1Body): Promise<IItem1> => {
  const { data } = await getApiRequestClient().put<IItem1>(buildRoute(ITEM1_KEYS.ITEM1_DETAIL, { id }), body);

  return data;
};

export const deleteItem1Request = async (id: string): Promise<void> => {
  await getApiRequestClient().delete(buildRoute(ITEM1_KEYS.ITEM1_DETAIL, { id }));
};
