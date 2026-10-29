import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

import { fontMono, fontSans } from '@/config/fonts';
import { JsonLd } from '@/components/seo/json-ld';
import { siteConfig } from '@/config/site';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { routing, toLocale } from '@/i18n/routing';
import { webSiteJsonLd } from '@/lib/seo';
import { cn } from '@/lib/utils';
import type { LayoutProps } from '@/types/type';
import '../../styles/globals.css';
import Providers from './providers';

export async function generateMetadata({ params }: Pick<LayoutProps<{ locale: string }>, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await useTranslationsServer('common.seo', locale);

  return {
    metadataBase: new URL(siteConfig.appUrl),
    applicationName: t('siteName'),
    // Pages override `title`; `%s` is replaced with their own title.
    title: { default: t('defaultTitle'), template: `%s | ${t('siteName')}` },
    description: t('description'),
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    formatDetection: { email: false, address: false, telephone: false },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-96x96-1.png',
      apple: '/apple-touch-icon.png',
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<{ locale: string }>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  const { t } = await useTranslationsServer('common.seo', locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning className={cn('antialiased', fontSans.variable, fontMono.variable)}>
        <JsonLd
          data={webSiteJsonLd({ locale: toLocale(locale), name: t('siteName'), description: t('description') })}
        />
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
