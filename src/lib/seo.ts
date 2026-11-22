import type { Metadata } from 'next';

import { siteConfig } from '@/config/site';
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

/** Query string of the parameters that change what a page lists (a category, a page number). Empty ones are left out. */
export const toQueryString = (query: Record<string, string | number | undefined> = {}): string => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query))
    if (value !== undefined && value !== '') params.set(key, `${value}`);

  return params.size ? `?${params}` : '';
};

/** `hreflang` map for a route, including `x-default`. Shared by page metadata and the sitemap. */
export const getLanguageAlternates = (path = '/', search = ''): Record<string, string> => ({
  ...Object.fromEntries(LOCALES.map((locale) => [locale, `${getAbsoluteUrl(locale, path)}${search}`])),
  'x-default': `${getAbsoluteUrl(DEFAULT_LOCALE, path)}${search}`,
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
  /** Parameters that belong to the canonical URL (category, page). Sorting and other view options do not. */
  query?: Record<string, string | number | undefined>;
  /** Image shown when the page is shared. Defaults to the site image. */
  image?: { url: string; alt: string };
  /** `article` adds the publication date to the Open Graph data. */
  article?: { publishedTime?: string };
  /** Page title (the site name is appended by the layout template) or `{ absolute }` to skip the template. Defaults to the site title. */
  title?: string | { absolute: string };
  /** Defaults to the site description. */
  description?: string;
  noIndex?: boolean;
}

/**
 * Full per-page metadata: title, description, canonical + hreflang, Open Graph, Twitter and robots.
 * Next.js replaces (not merges) nested objects such as `openGraph`, so every page builds them in full here.
 */
export const buildMetadata = async ({
  locale,
  path = '/',
  query,
  image,
  article,
  title: pageTitle,
  description: pageDescription,
  noIndex = false,
}: BuildMetadataOptions): Promise<Metadata> => {
  const { t } = await useTranslationsServer('common.seo', locale);
  const siteName = t('siteName');
  // No title: the page keeps the layout's default title (the home page).
  const title = pageTitle ?? { absolute: t('defaultTitle') };
  const description = pageDescription ?? t('description');
  const fullTitle = typeof title === 'string' ? `${title} | ${siteName}` : title.absolute;
  const search = toQueryString(query);
  const url = `${getAbsoluteUrl(locale, path)}${search}`;

  return {
    title,
    description,
    alternates: { canonical: url, languages: getLanguageAlternates(path, search) },
    robots: getRobots(noIndex),
    openGraph: {
      ...(article ? { type: 'article' as const, ...article } : { type: 'website' as const }),
      siteName,
      title: fullTitle,
      description,
      url,
      locale: LOCALE_OG[locale],
      alternateLocale: LOCALES.filter((item) => item !== locale).map((item) => LOCALE_OG[item]),
      // Nested objects replace the parent's, so the root-level `opengraph-image` must be referenced here.
      images: [image ?? { url: '/opengraph-image', ...OG_IMAGE_SIZE, alt: siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image?.url ?? '/twitter-image'],
    },
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
  publisher: { '@id': ORGANIZATION_ID },
});

const ORGANIZATION_ID = `${env.APP_URL}/#organization`;

/** The shop itself: name, logo, phone and Facebook page. Referenced by the site, product and article data. */
export const organizationJsonLd = ({ description, telephone }: { description: string; telephone?: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'HomeGoodsStore',
  '@id': ORGANIZATION_ID,
  name: siteConfig.name,
  description,
  url: env.APP_URL,
  logo: `${env.APP_URL}/android-chrome-512x512.png`,
  image: `${env.APP_URL}/opengraph-image`,
  sameAs: [siteConfig.facebookUrl],
  ...(telephone
    ? {
        telephone,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone,
          contactType: 'sales',
          areaServed: 'VN',
          availableLanguage: [...LOCALES],
        },
      }
    : {}),
});

interface ProductJsonLdInput {
  url: string;
  name: string;
  description: string;
  images: string[];
  category?: string;
  /** Price the customer pays per unit of measure (after any discount). */
  price: number;
  /** `MTR` (metre of width) or `MTK` (square metre), UN/CEFACT codes. */
  unitCode: 'MTR' | 'MTK';
}

export const productJsonLd = ({ url, name, description, images, category, price, unitCode }: ProductJsonLdInput) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name,
  description: description || undefined,
  image: images.length ? images : undefined,
  category,
  url,
  brand: { '@type': 'Brand', name: siteConfig.name },
  offers: {
    '@type': 'Offer',
    url,
    priceCurrency: 'VND',
    price,
    priceSpecification: { '@type': 'UnitPriceSpecification', price, priceCurrency: 'VND', unitCode },
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': ORGANIZATION_ID },
  },
});

interface ArticleJsonLdInput {
  url: string;
  locale: Locale;
  headline: string;
  description: string;
  image?: string | null;
  datePublished?: string | null;
}

export const articleJsonLd = ({ url, locale, headline, description, image, datePublished }: ArticleJsonLdInput) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline,
  description: description || undefined,
  image: image || undefined,
  datePublished: datePublished || undefined,
  inLanguage: locale,
  mainEntityOfPage: url,
  author: { '@id': ORGANIZATION_ID },
  publisher: { '@id': ORGANIZATION_ID },
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
