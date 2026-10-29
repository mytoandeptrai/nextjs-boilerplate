import type { NextRequest } from 'next/server';

import { AUTH_KEYS } from '@/api/auth/keys';
import { createLoginSchema } from '@/api/auth/schema';
import type { ILoginResponse } from '@/api/auth/type';
import { request } from '@/api/axios';
import { isDemoMode } from '@/constants/env';
import { HttpStatus } from '@/enums/enum';
import { demoLogin } from '@/lib/server/demo-auth';
import { parseTokenPair, setAuthCookies } from '@/lib/server/backend';
import { createApiErrorResponse } from '@/utils/api-error';

const loginSchema = createLoginSchema({ invalidEmail: 'Invalid email', passwordRequired: 'Password is required' });

/** Browser -> /api/auth/login -> backend /auth/login. The tokens never reach the browser: they become httpOnly cookies. */
export async function POST(req: NextRequest) {
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return Response.json({ message: parsed.error.issues[0]?.message }, { status: HttpStatus.BAD_REQUEST });
  }

  try {
    const { data } = isDemoMode ? demoLogin(parsed.data) : await request.post(AUTH_KEYS.LOGIN, parsed.data);
    const tokens = parseTokenPair(data);

    // Never answer "authenticated" without tokens: the cookies would be empty and the guard would bounce the user.
    if (!tokens) {
      return Response.json(
        { message: 'Login response has no accessToken/refreshToken' },
        { status: HttpStatus.BAD_GATEWAY }
      );
    }

    await setAuthCookies(tokens);

    return Response.json({ authenticated: true } satisfies ILoginResponse);
  } catch (error) {
    return createApiErrorResponse(error, 'Failed to sign in');
  }
}
