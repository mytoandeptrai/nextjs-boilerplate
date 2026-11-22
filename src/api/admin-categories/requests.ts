import { buildRoute } from '@/constants/routes';
import type { IAdminCategory, ICategory } from '@/types/catalog';
import { requestInternal } from '../axios';
import { ADMIN_CATEGORY_KEYS } from './keys';
import type { CategoryBody } from './schema';

export const getAdminCategoriesRequest = async (): Promise<IAdminCategory[]> =>
  (await requestInternal.get<IAdminCategory[]>(ADMIN_CATEGORY_KEYS.LIST)).data;

export const createAdminCategoryRequest = async (body: CategoryBody): Promise<ICategory> =>
  (await requestInternal.post<ICategory>(ADMIN_CATEGORY_KEYS.LIST, body)).data;

export const updateAdminCategoryRequest = async ({
  id,
  body,
}: {
  id: string;
  body: CategoryBody;
}): Promise<ICategory> =>
  (await requestInternal.put<ICategory>(buildRoute(ADMIN_CATEGORY_KEYS.DETAIL, { id }), body)).data;

export const deleteAdminCategoryRequest = async (id: string): Promise<void> => {
  await requestInternal.delete(buildRoute(ADMIN_CATEGORY_KEYS.DETAIL, { id }));
};
