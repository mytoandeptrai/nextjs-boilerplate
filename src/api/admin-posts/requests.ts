import { buildRoute } from '@/constants/routes';
import type { IBlogPost } from '@/types/catalog';
import { requestInternal } from '../axios';
import { ADMIN_POST_KEYS } from './keys';
import type { PostBody } from './schema';

export const getAdminPostsRequest = async (): Promise<IBlogPost[]> =>
  (await requestInternal.get<IBlogPost[]>(ADMIN_POST_KEYS.LIST)).data;

export const getAdminPostRequest = async (id: string): Promise<IBlogPost> =>
  (await requestInternal.get<IBlogPost>(buildRoute(ADMIN_POST_KEYS.DETAIL, { id }))).data;

export const createAdminPostRequest = async (body: PostBody): Promise<IBlogPost> =>
  (await requestInternal.post<IBlogPost>(ADMIN_POST_KEYS.LIST, body)).data;

export const updateAdminPostRequest = async ({ id, body }: { id: string; body: PostBody }): Promise<IBlogPost> =>
  (await requestInternal.put<IBlogPost>(buildRoute(ADMIN_POST_KEYS.DETAIL, { id }), body)).data;

export const deleteAdminPostRequest = async (id: string): Promise<void> => {
  await requestInternal.delete(buildRoute(ADMIN_POST_KEYS.DETAIL, { id }));
};
