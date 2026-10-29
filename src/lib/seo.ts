import type { Metadata } from 'next';

import { OG_IMAGE_SIZE } from '@/constants/const';
import { env, isProductionEnv } from '@/constants/env';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { DEFAULT_LOCALE, LOCALE_OG, LOCALES, type Locale } from '@/i18n/routing';

/** Path of a route in a locale: the default locale has no prefix (`/health`, `/vi/health`). */
export const getLocalizedPath = (locale: Locale, path = '/'): string => {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  const suffix = path === '/' ? '' : path;

  return `${prefix}${suffix}` || '/';
};

export const getAbsoluteUrl = (locale: Locale, path = '/'): string => `${env.APP_URL}${getLocalizedPath(locale, path)}`;

/** `hreflang` map for a route, including `x-default`. Shared by page metadata and the sitemap. */
export const getLanguageAlternates = (path = '/'): Record<string, string> => ({
  ...Object.fromEntries(LOCALES.map((locale) => [locale, getAbsoluteUrl(locale, path)])),
  'x-default': getAbsoluteUrl(DEFAULT_LOCALE, path),
});

/** Non-production environments are never indexed. */
export const getRobots = (noIndex = false): Metadata['robots'] =>
  noIndex || !isProductionEnv
    ? { index: false, follow: false, googleBot: { index: false, follow: false } }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      };

interface BuildMetadataOptions {
  locale: Locale;
  /** Route without the locale prefix, e.g. `/health`. */
  path?: string;
  /** Page title (the site name is appended by the layout template) or `{ absolute }` to skip the template. */
  title: string | { absolute: string };
  description: string;
  noIndex?: boolean;
}

/**
 * Full per-page metadata: title, description, canonical + hreflang, Open Graph, Twitter and robots.
 * Next.js replaces (not merges) nested objects such as `openGraph`, so every page builds them in full here.
 */
export const buildMetadata = async ({
  locale,
  path = '/',
  title,
  description,
  noIndex = false,
}: BuildMetadataOptions): Promise<Metadata> => {
  const { t } = await useTranslationsServer('common.seo', locale);
  const siteName = t('siteName');
  const fullTitle = typeof title === 'string' ? `${title} | ${siteName}` : title.absolute;
  const url = getAbsoluteUrl(locale, path);

  return {
    title,
    description,
    alternates: { canonical: url, languages: getLanguageAlternates(path) },
    robots: getRobots(noIndex),
    openGraph: {
      type: 'website',
      siteName,
      title: fullTitle,
      description,
      url,
      locale: LOCALE_OG[locale],
      alternateLocale: LOCALES.filter((item) => item !== locale).map((item) => LOCALE_OG[item]),
      // Nested objects replace the parent's, so the root-level `opengraph-image` must be referenced here.
      images: [{ url: '/opengraph-image', ...OG_IMAGE_SIZE, alt: siteName }],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: ['/twitter-image'] },
  };
};

/* -------------------------------------------------------------------------- */
/*                          JSON-LD (schema.org) builders                      */
/* -------------------------------------------------------------------------- */

export const webSiteJsonLd = ({
  locale,
  name,
  description,
}: {
  locale: Locale;
  name: string;
  description: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name,
  description,
  url: getAbsoluteUrl(locale),
  inLanguage: locale,
});

export const breadcrumbJsonLd = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});
