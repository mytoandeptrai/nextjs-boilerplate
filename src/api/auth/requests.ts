import { requestInternal } from '../axios';
import { AUTH_KEYS } from './keys';
import type { ILoginBody, ILoginResponse } from './type';

export const loginRequest = async (body: ILoginBody): Promise<ILoginResponse> => {
  const { data } = await requestInternal.post<ILoginResponse>(AUTH_KEYS.LOGIN, body);

  return data;
};

export const logoutRequest = async (): Promise<void> => {
  await requestInternal.post(AUTH_KEYS.LOGOUT);
};
