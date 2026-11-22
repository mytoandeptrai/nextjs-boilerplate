import { buildRoute } from '@/constants/routes';
import type { ILookbook } from '@/types/catalog';
import { requestInternal } from '../axios';
import { ADMIN_LOOKBOOK_KEYS } from './keys';
import type { LookbookBody } from './schema';

export const getAdminLookbooksRequest = async (): Promise<ILookbook[]> =>
  (await requestInternal.get<ILookbook[]>(ADMIN_LOOKBOOK_KEYS.LIST)).data;

export const getAdminLookbookRequest = async (id: string): Promise<ILookbook> =>
  (await requestInternal.get<ILookbook>(buildRoute(ADMIN_LOOKBOOK_KEYS.DETAIL, { id }))).data;

export const createAdminLookbookRequest = async (body: LookbookBody): Promise<ILookbook> =>
  (await requestInternal.post<ILookbook>(ADMIN_LOOKBOOK_KEYS.LIST, body)).data;

export const updateAdminLookbookRequest = async ({
  id,
  body,
}: {
  id: string;
  body: LookbookBody;
}): Promise<ILookbook> =>
  (await requestInternal.put<ILookbook>(buildRoute(ADMIN_LOOKBOOK_KEYS.DETAIL, { id }), body)).data;

export const deleteAdminLookbookRequest = async (id: string): Promise<void> => {
  await requestInternal.delete(buildRoute(ADMIN_LOOKBOOK_KEYS.DETAIL, { id }));
};
