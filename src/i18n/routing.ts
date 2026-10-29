import { defineRouting } from 'next-intl/routing';

export const LOCALES = ['en', 'vi'] as const;
export const DEFAULT_LOCALE = 'en';
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

/** Open Graph locale codes (`og:locale`). */
export const LOCALE_OG: Record<Locale, string> = {
  en: 'en_US',
  vi: 'vi_VN',
};

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  // `/item1` for the default locale, `/vi/item1` for the others (same URLs as before the migration).
  localePrefix: 'as-needed',
});

/** Narrow an untyped route param to a supported locale (falls back to the default). */
export const toLocale = (value: string): Locale =>
  (LOCALES as readonly string[]).includes(value) ? (value as Locale) : DEFAULT_LOCALE;
