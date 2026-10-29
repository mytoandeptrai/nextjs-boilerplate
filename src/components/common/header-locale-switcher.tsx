'use client';

import { useSearchParams } from 'next/navigation';

import { useTranslations } from '@/hooks';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { LocaleSelect } from './locale-select';

export function HeaderLocaleSwitcher() {
  const { locale } = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const _handleChange = (value: Locale) => {
    const query = searchParams.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, { locale: value });
  };

  return <LocaleSelect value={locale} onValueChange={_handleChange} />;
}
