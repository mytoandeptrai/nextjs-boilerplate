import type { Metadata } from 'next';

import { ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { toLocale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import React19Page from '@/modules/react-19-page';
import type { PageProps } from '@/types/type';

// Request-time rendering: the promise handed to `use()` is created per request, not at build time.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Pick<PageProps<{ locale: string }>, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await useTranslationsServer('common.seo', locale);

  return buildMetadata({
    locale: toLocale(locale),
    path: ROUTES.REACT_19,
    title: t('react19'),
    description: t('description'),
    noIndex: true,
  });
}

export default function Page() {
  return <React19Page />;
}
