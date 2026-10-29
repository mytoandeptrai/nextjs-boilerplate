import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';
import { messages } from '@/messages';
import { routing } from './routing';

export default getRequestConfig(async ({ locale: override }) => {
  const requested = override ?? (await rootParams.locale());
  if (!hasLocale(routing.locales, requested)) notFound();
  const locale = requested;

  return { locale, messages: messages[locale] };
});
