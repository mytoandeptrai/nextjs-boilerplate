import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { toLocale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import Item1Page from '@/modules/item1-page';
import type { PageProps } from '@/types/type';

export async function generateMetadata({ params }: Pick<PageProps<{ locale: string }>, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await useTranslationsServer('common.seo', locale);

  // Behind the session guard: kept out of search engines.
  return buildMetadata({
    locale: toLocale(locale),
    path: ROUTES.ITEM1,
    title: t('item1'),
    description: t('description'),
    noIndex: true,
  });
}

export default function Page() {
  return (
    <Suspense>
      <Item1Page />
    </Suspense>
  );
}
