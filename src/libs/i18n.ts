import { createInstance, type i18n, type ResourceLanguage } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import i18nConfig from '@/i18nConfig';

export default async function initTranslations(
  locale: string,
  i18nInstance?: i18n,
  resources?: { [key: string]: ResourceLanguage }
) {
  i18nInstance = i18nInstance || createInstance();

  console.log('resources', resources);

  i18nInstance.use(initReactI18next);

  if (!resources) {
    i18nInstance.use(resourcesToBackend((language: string) => import(`@/locales/${language}.json`)));
  }

  await i18nInstance.init({
    lng: locale,
    resources,
    fallbackLng: i18nConfig.defaultLocale,
    supportedLngs: i18nConfig.locales,
    preload: resources ? [] : i18nConfig.locales,
  });

  return {
    i18n: i18nInstance,
    resources: { [locale]: i18nInstance.services.resourceStore.data[locale] },
    t: i18nInstance.t,
  };
}
