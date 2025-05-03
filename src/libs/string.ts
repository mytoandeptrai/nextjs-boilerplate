import type { MultiLanguageString } from '@/types/common';

export function getMultiLanguageString(multiLangString: MultiLanguageString, locale: string, defaultLocale: string) {
  return multiLangString[locale] ?? multiLangString[defaultLocale] ?? Object.values(multiLangString)[0] ?? '';
}
