'use client';
import React from 'react';

import { LocaleSelect } from './locale-select';
import { useSearchParams, usePathname } from 'next/navigation';
import type { SupportedLocale } from '@/i18nConfig';
import { useLocale } from '@/components/providers';

export function HeaderLocaleSwitcher() {
  const { locale } = useLocale();
  const searchParams = useSearchParams();

  let pathname = usePathname();
  if (new RegExp(`^/${locale}(\/|$)`).test(pathname)) {
    pathname = pathname.replace(`/${locale}`, '');
  }

  const _handleChange = (value: string) => {
    window.location.href = `/${value}${pathname}?${searchParams.toString()}`;
  };

  return <LocaleSelect value={locale as SupportedLocale} onValueChange={_handleChange} />;
}
