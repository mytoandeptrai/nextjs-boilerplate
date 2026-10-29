import 'server-only';

import { DEMO_ACCOUNT } from '@/constants/const';
import { HttpStatus } from '@/enums/enum';
import type { ILoginBody } from '@/api/auth/type';
import type { ITokenPair } from '@/types/type';

/**
 * Stand-in for the backend `POST /auth/login` while no backend is configured. Same contract as the real thing:
 * a token pair on success, a rejected request (picked up by `createApiErrorResponse`) otherwise.
 */
export const demoLogin = ({ email, password }: ILoginBody): { data: ITokenPair } => {
  if (email !== DEMO_ACCOUNT.email || password !== DEMO_ACCOUNT.password) {
    throw { status: HttpStatus.UNAUTHORIZED, message: 'Invalid email or password' };
  }

  return { data: { accessToken: 'demo-access-token', refreshToken: 'demo-refresh-token' } };
};
