export type SupportedLocale = 'en' | 'vi';

const i18nConfig = {
  locales: ['en', 'vi'],
  defaultLocale: 'en',
} as {
  locales: SupportedLocale[];
  defaultLocale: SupportedLocale;
};

export default i18nConfig;
