import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

import { getZaloHotline } from '@/api/catalog/requests';
import { fontMono, fontSans } from '@/config/fonts';
import { JsonLd } from '@/components/seo/json-ld';
import { siteConfig } from '@/config/site';
import { env } from '@/constants/env';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { routing, toLocale } from '@/i18n/routing';
import { organizationJsonLd, webSiteJsonLd } from '@/lib/seo';
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
    keywords: t('keywords'),
    category: 'shopping',
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    formatDetection: { email: false, address: false, telephone: false },
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      ],
      apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
    },
    verification: env.GOOGLE_SITE_VERIFICATION ? { google: env.GOOGLE_SITE_VERIFICATION } : undefined,
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: siteConfig.themeColor,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<{ locale: string }>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  const { t } = await useTranslationsServer('common.seo', locale);
  const zaloHotline = await getZaloHotline();

  return (
    <html lang={locale} data-scroll-behavior='smooth' suppressHydrationWarning>
      <body suppressHydrationWarning className={cn('antialiased', fontSans.variable, fontMono.variable)}>
        <JsonLd
          data={webSiteJsonLd({ locale: toLocale(locale), name: t('siteName'), description: t('description') })}
        />
        <JsonLd data={organizationJsonLd({ description: t('description'), telephone: zaloHotline || undefined })} />
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
