import type { MetadataRoute } from 'next';

import { env, isProductionEnv } from '@/constants/env';
import { ROUTES } from '@/constants/routes';
import { LOCALES } from '@/i18n/routing';
import { getLocalizedPath } from '@/lib/seo';

/** Private or personal pages, in every locale: the API, the admin portal and the cart. */
const DISALLOWED = [
  '/api/',
  ...LOCALES.flatMap((locale) => [ROUTES.ADMIN, ROUTES.CART].map((route) => getLocalizedPath(locale, route))),
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: isProductionEnv ? { userAgent: '*', allow: '/', disallow: DISALLOWED } : { userAgent: '*', disallow: '/' },
    sitemap: `${env.APP_URL}/sitemap.xml`,
    host: env.APP_URL,
  };
}
