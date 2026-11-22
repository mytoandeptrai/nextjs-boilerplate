import { useQuery } from '@tanstack/react-query';

import type { IApiError } from '@/types/type';
import { ADMIN_SETTINGS_KEYS } from './keys';
import { getSettingsRequest } from './requests';
import type { SettingsBody } from './schema';

export const useSettingsQuery = () =>
  useQuery<SettingsBody, IApiError>({
    queryKey: ADMIN_SETTINGS_KEYS.detail,
    queryFn: getSettingsRequest,
    refetchOnMount: 'always',
  });
