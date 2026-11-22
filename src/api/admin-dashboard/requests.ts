import { requestInternal } from '../axios';
import { ADMIN_DASHBOARD_KEYS } from './keys';
import type { IDashboardResponse } from './type';

export const getDashboardRequest = async (): Promise<IDashboardResponse> =>
  (await requestInternal.get<IDashboardResponse>(ADMIN_DASHBOARD_KEYS.ROOT)).data;
