import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { IApiError } from '@/types/type';
import { ADMIN_SETTINGS_KEYS } from './keys';
import { updateSettingsRequest } from './requests';
import type { SettingsBody } from './schema';

export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<SettingsBody, IApiError, SettingsBody>({
    mutationFn: updateSettingsRequest,
    onSuccess: (data) => queryClient.setQueryData(ADMIN_SETTINGS_KEYS.detail, data),
  });
};
