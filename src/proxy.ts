import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import { COOKIE_KEYS } from '@/constants/const';
import { ADMIN_REAUTH_PARAM, isAdminPath, ROUTES, safeAdminNext } from '@/constants/routes';
import { DEFAULT_LOCALE, LOCALES, routing } from './i18n/routing';

// Next.js 16 renamed `middleware.ts` to `proxy.ts`. next-intl negotiates the locale and handles redirects here.
const intlProxy = createMiddleware(routing);

const LOCALE_PREFIX = new RegExp(`^/(${LOCALES.join('|')})(?=/|$)`);
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
/** Renew this long before the access token expires, so the page render never sees an expired one. */
const EXPIRY_MARGIN_SECONDS = 60;

const splitLocale = (pathname: string) => {
  const locale = pathname.match(LOCALE_PREFIX)?.[1] ?? DEFAULT_LOCALE;
  const path = pathname.replace(LOCALE_PREFIX, '') || '/';

  return { locale, path };
};

const withLocale = (locale: string, path: string) => {
  if (locale === DEFAULT_LOCALE) return path;

  return path === '/' ? `/${locale}` : `/${locale}${path}`;
};

/** Read `exp` from a JWT without verifying it: this only decides whether to renew, never whether to trust. */
export const isTokenExpired = (token: string | undefined, now = Date.now()): boolean => {
  try {
    const payload = JSON.parse(atob((token ?? '').split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));

    return typeof payload.exp !== 'number' || payload.exp - EXPIRY_MARGIN_SECONDS <= now / 1000;
  } catch {
    return true;
  }
};

interface ITokens {
  access_token: string;
  refresh_token: string;
}

const refreshTokens = async (refreshToken: string): Promise<ITokens | null> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  try {
    const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
      signal: AbortSignal.timeout(8000),
    });
    const data = response.ok ? ((await response.json()) as Partial<ITokens>) : null;

    return data?.access_token && data.refresh_token ? (data as ITokens) : null;
  } catch {
    return null;
  }
};

/**
 * The storefront is public. `/admin/*` needs a session cookie; this is only a fast redirect, the real check
 * (token verified with Supabase + admin role) happens in the admin layout and in every `/api/admin/*` handler.
 */
export default async function proxy(req: NextRequest) {
  const { locale, path } = splitLocale(req.nextUrl.pathname);

  if (!isAdminPath(path)) return intlProxy(req);

  const accessToken = req.cookies.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
  const refreshToken = req.cookies.get(COOKIE_KEYS.REFRESH_TOKEN)?.value;
  const isLogin = path === ROUTES.ADMIN_LOGIN;

  // Server Components cannot write cookies, so an expired access token is renewed here, before the render.
  const renewed = refreshToken && isTokenExpired(accessToken) ? await refreshTokens(refreshToken) : null;
  const hasSession = Boolean(renewed) || !isTokenExpired(accessToken);

  if (renewed) {
    req.cookies.set(COOKIE_KEYS.ACCESS_TOKEN, renewed.access_token);
    req.cookies.set(COOKIE_KEYS.REFRESH_TOKEN, renewed.refresh_token);
  }

  let response: NextResponse;

  if (!hasSession && !isLogin) {
    const login = new URL(withLocale(locale, ROUTES.ADMIN_LOGIN), req.url);

    login.searchParams.set('next', path);
    response = NextResponse.redirect(login);
  } else if (hasSession && isLogin && !req.nextUrl.searchParams.has(ADMIN_REAUTH_PARAM)) {
    response = NextResponse.redirect(
      new URL(withLocale(locale, safeAdminNext(req.nextUrl.searchParams.get('next'))), req.url)
    );
  } else {
    response = intlProxy(req);
  }

  // The admin portal is never indexed.
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');

  if (renewed) {
    const options = {
      httpOnly: true,
      secure: req.nextUrl.protocol === 'https:',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: SESSION_MAX_AGE,
    };

    response.cookies.set(COOKIE_KEYS.ACCESS_TOKEN, renewed.access_token, options);
    response.cookies.set(COOKIE_KEYS.REFRESH_TOKEN, renewed.refresh_token, options);
  } else if (!hasSession && (accessToken || refreshToken)) {
    response.cookies.delete(COOKIE_KEYS.ACCESS_TOKEN);
    response.cookies.delete(COOKIE_KEYS.REFRESH_TOKEN);
  }

  return response;
}

export const config = {
  // Skip API routes, Next internals, metadata files and files with an extension.
  matcher: ['/((?!api|_next|_vercel|opengraph-image|twitter-image|.*\\..*).*)'],
};
