import { buildRoute } from '@/constants/routes';
import type { IProduct } from '@/types/catalog';
import { requestInternal } from '../axios';
import { ADMIN_PRODUCT_KEYS } from './keys';
import type { ProductBody } from './schema';

export const getAdminProductsRequest = async (): Promise<IProduct[]> =>
  (await requestInternal.get<IProduct[]>(ADMIN_PRODUCT_KEYS.LIST)).data;

export const getAdminProductRequest = async (id: string): Promise<IProduct> =>
  (await requestInternal.get<IProduct>(buildRoute(ADMIN_PRODUCT_KEYS.DETAIL, { id }))).data;

export const createAdminProductRequest = async (body: ProductBody): Promise<IProduct> =>
  (await requestInternal.post<IProduct>(ADMIN_PRODUCT_KEYS.LIST, body)).data;

export const updateAdminProductRequest = async ({ id, body }: { id: string; body: ProductBody }): Promise<IProduct> =>
  (await requestInternal.put<IProduct>(buildRoute(ADMIN_PRODUCT_KEYS.DETAIL, { id }), body)).data;

export const deleteAdminProductRequest = async (id: string): Promise<void> => {
  await requestInternal.delete(buildRoute(ADMIN_PRODUCT_KEYS.DETAIL, { id }));
};
