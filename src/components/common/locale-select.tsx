'use client';

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LOCALES, type Locale } from '@/i18n/routing';
import { useTranslations } from '@/hooks';

type LocaleSelectProps = {
  value?: Locale;
  onValueChange?: (value: Locale) => void;
};

export function LocaleSelect({ value, onValueChange }: LocaleSelectProps) {
  const { t } = useTranslations();

  const _handleChange = (value: string) => {
    onValueChange?.(value as Locale);
  };

  return (
    <Select value={value} onValueChange={_handleChange}>
      <SelectTrigger>
        <SelectValue placeholder='Select a fruit' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {LOCALES.map((locale) => (
            <SelectItem key={locale} value={locale}>
              {t(`langName.${locale}`)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
