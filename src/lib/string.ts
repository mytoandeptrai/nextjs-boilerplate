import type { IMultiLanguageString } from '@/types/type';

export function getIMultiLanguageString(multiLangString: IMultiLanguageString, locale: string, defaultLocale: string) {
  return multiLangString[locale] ?? multiLangString[defaultLocale] ?? Object.values(multiLangString)[0] ?? '';
}
