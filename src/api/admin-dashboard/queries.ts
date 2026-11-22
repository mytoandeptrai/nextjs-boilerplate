import { useQuery } from '@tanstack/react-query';

import type { IApiError } from '@/types/type';
import { ADMIN_DASHBOARD_KEYS } from './keys';
import { getDashboardRequest } from './requests';
import type { IDashboardResponse } from './type';

export const useDashboardQuery = () =>
  useQuery<IDashboardResponse, IApiError>({
    queryKey: ADMIN_DASHBOARD_KEYS.detail,
    queryFn: getDashboardRequest,
    refetchOnMount: 'always',
  });
