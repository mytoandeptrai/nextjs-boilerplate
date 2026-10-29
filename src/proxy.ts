import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import { COOKIE_KEYS } from '@/constants/const';
import { PUBLIC_ROUTES, ROUTES } from '@/constants/routes';
import { DEFAULT_LOCALE, LOCALES, routing } from './i18n/routing';

// Next.js 16 renamed `middleware.ts` to `proxy.ts`. next-intl negotiates the locale and handles redirects here.
const intlProxy = createMiddleware(routing);

const LOCALE_PREFIX = new RegExp(`^/(${LOCALES.join('|')})(?=/|$)`);

const splitLocale = (pathname: string) => {
  const locale = pathname.match(LOCALE_PREFIX)?.[1] ?? DEFAULT_LOCALE;
  const path = pathname.replace(LOCALE_PREFIX, '') || '/';

  return { locale, path };
};

const withLocale = (locale: string, path: string) => {
  if (locale === DEFAULT_LOCALE) return path;

  return path === '/' ? `/${locale}` : `/${locale}${path}`;
};

/** Session guard: the BFF stores the tokens in httpOnly cookies, so the server can decide before rendering. */
export default function proxy(req: NextRequest) {
  const { locale, path } = splitLocale(req.nextUrl.pathname);
  const hasSession = Boolean(
    req.cookies.get(COOKIE_KEYS.ACCESS_TOKEN)?.value || req.cookies.get(COOKIE_KEYS.REFRESH_TOKEN)?.value
  );
  const isPublic = PUBLIC_ROUTES.includes(path);

  if (!hasSession && !isPublic) return NextResponse.redirect(new URL(withLocale(locale, ROUTES.LOGIN), req.url));
  if (hasSession && isPublic) return NextResponse.redirect(new URL(withLocale(locale, ROUTES.HOME), req.url));

  return intlProxy(req);
}

export const config = {
  // Skip API routes, Next internals, metadata files and files with an extension.
  matcher: ['/((?!api|_next|_vercel|opengraph-image|twitter-image|.*\\..*).*)'],
};
