import { getLocale, getTranslations } from 'next-intl/server';

import type { Locale } from '@/i18n/routing';
import type { Namespace, Translator } from '@/types/translation';

/**
 * Typed translations for **Server Components, `generateMetadata` and Route Handlers**.
 * Not exported from the `@/hooks` barrel so `next-intl/server` never reaches a client bundle.
 *
 * Pass `locale` explicitly in Route Handlers and Server Actions, where root params are unavailable.
 *
 * @example
 * const { t } = await useTranslationsServer('health');
 * const { t } = await useTranslationsServer('health', locale);
 * const { t } = await useTranslationsServer(); // no namespace: use the full path
 * const { t } = await useTranslationsServer(undefined, locale); // full path, explicit locale
 */
export async function useTranslationsServer(): Promise<{ t: Translator; locale: Locale }>;
export async function useTranslationsServer(
  namespace: undefined,
  locale: string
): Promise<{ t: Translator; locale: Locale }>;
export async function useTranslationsServer<NS extends Namespace>(
  namespace: NS,
  locale?: string
): Promise<{ t: Translator<NS>; locale: Locale }>;
export async function useTranslationsServer(
  namespace?: Namespace,
  locale?: string
): Promise<{ t: any; locale: Locale }> {
  const resolvedLocale = (locale ?? (await getLocale())) as Locale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: namespace as never });

  return { t, locale: resolvedLocale };
}
