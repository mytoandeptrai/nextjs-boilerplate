'use client';
import * as React from 'react';

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import i18nConfig, { type SupportedLocale } from '@/i18nConfig';
import { useTranslation } from 'react-i18next';

type LocaleSelectProps = {
  value?: SupportedLocale;
  onValueChange?: (value: SupportedLocale) => void;
};

export function LocaleSelect({ value, onValueChange }: LocaleSelectProps) {
  const { t } = useTranslation();

  const _handleChange = (value: string) => {
    onValueChange?.(value as SupportedLocale);
  };

  return (
    <Select value={value} onValueChange={_handleChange}>
      <SelectTrigger>
        <SelectValue placeholder='Select a fruit' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {i18nConfig.locales.map((locale) => (
            <SelectItem key={locale} value={locale}>
              {t(`langName.${locale}`)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
