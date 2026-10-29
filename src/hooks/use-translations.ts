'use client';

import { useLocale, useTranslations as useNextIntlTranslations } from 'next-intl';

import type { Locale } from '@/i18n/routing';
import type { Namespace, Translator } from '@/types/translation';

/**
 * Typed translations for **Client Components**. Keys autocomplete and are checked against `src/messages`.
 * Server counterpart: `useTranslationsServer` from `@/hooks/useTranslationsServer`.
 *
 * @example
 * const { t } = useTranslations('common.actions');
 * t('retry');
 *
 * const { t } = useTranslations(); // no namespace: use the full path
 * t('common.actions.retry');
 */
export function useTranslations(): { t: Translator; locale: Locale };
export function useTranslations<NS extends Namespace>(namespace: NS): { t: Translator<NS>; locale: Locale };
export function useTranslations(namespace?: Namespace): { t: any; locale: Locale } {
  const t = useNextIntlTranslations(namespace as never);
  const locale = useLocale() as Locale;

  return { t, locale };
}
