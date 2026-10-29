import type { NextRequest } from 'next/server';

import { AUTH_KEYS } from '@/api/auth/keys';
import { createLoginSchema } from '@/api/auth/schema';
import type { ILoginResponse } from '@/api/auth/type';
import { request } from '@/api/axios';
import { HttpStatus } from '@/enums/enum';
import { setAuthCookies } from '@/lib/server/backend';
import type { ITokenPair } from '@/types/type';
import { createApiErrorResponse } from '@/utils/api-error';

const loginSchema = createLoginSchema({ invalidEmail: 'Invalid email', passwordRequired: 'Password is required' });

/** Browser -> /api/auth/login -> backend /auth/login. The tokens never reach the browser: they become httpOnly cookies. */
export async function POST(req: NextRequest) {
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return Response.json({ message: parsed.error.issues[0]?.message }, { status: HttpStatus.BAD_REQUEST });
  }

  try {
    const { data } = await request.post<ITokenPair>(AUTH_KEYS.LOGIN, parsed.data);

    await setAuthCookies(data);

    return Response.json({ authenticated: true } satisfies ILoginResponse);
  } catch (error) {
    return createApiErrorResponse(error, 'Failed to sign in');
  }
}
