'use client';

import { I18nextProvider } from 'react-i18next';
import initTranslations from '@/libs/i18n';
import { createInstance, type ResourceKey, type ResourceLanguage } from 'i18next';
import { initDayjs } from '@/libs/dayjs';
import { createContext, useContext } from 'react';
import i18nConfig, { type SupportedLocale } from '@/i18nConfig';
import { z } from 'zod';
import { makeZodI18nMap } from 'zod-i18n-map';
import zodEnTranslation from '@/locales/zod/en.json';
import zodViTranslation from '@/locales/zod/vi.json';

const zodTranslations = {
  en: zodEnTranslation,
  vi: zodViTranslation,
} as Record<string, ResourceKey>;

const LocaleContext = createContext(i18nConfig.defaultLocale);
export const useLocale = () => {
  const locale = useContext(LocaleContext);
  if (!locale) {
    throw new Error('useLocale must be used within a TranslationsProvider');
  }

  return { locale, defaultLocale: i18nConfig.defaultLocale };
};

export function TranslationsProvider({
  children,
  locale,
  resources,
}: {
  children: React.ReactNode;
  locale: string;
  resources: { [key: string]: ResourceLanguage };
}) {
  const i18n = createInstance();

  const zodTranslation = zodTranslations[locale];
  resources[locale].zod = zodTranslation;

  initTranslations(locale, i18n, resources);
  initDayjs(locale);

  const zodI18nMap = makeZodI18nMap({
    t: i18n.t,
  });
  z.setErrorMap(zodI18nMap);

  return (
    <LocaleContext.Provider value={locale as SupportedLocale}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </LocaleContext.Provider>
  );
}
