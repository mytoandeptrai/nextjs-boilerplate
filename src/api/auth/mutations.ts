import { useMutation } from '@tanstack/react-query';

import { useSessionStore } from '@/stores';
import type { IApiError } from '@/types/type';
import { loginRequest, logoutRequest } from './requests';
import type { ILoginBody, ILoginResponse } from './type';

export const useLoginMutation = () =>
  useMutation<ILoginResponse, IApiError, ILoginBody>({
    mutationKey: ['login'],
    mutationFn: loginRequest,
    onSuccess: () => useSessionStore.getState().startSession(),
  });

export const useLogoutMutation = () =>
  useMutation<void, IApiError>({
    mutationKey: ['logout'],
    mutationFn: logoutRequest,
    onSuccess: () => useSessionStore.getState().clearSession(),
  });
