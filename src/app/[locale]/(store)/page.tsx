import type { Metadata } from 'next';

import { ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { toLocale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import type { PageProps } from '@/types/type';
import HomePage from '@/modules/home-page';

/** Catalogue pages are cached and refreshed at most once a minute; admin changes revalidate them at once. */
export const revalidate = 60;

export async function generateMetadata({ params }: Pick<PageProps<{ locale: string }>, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await useTranslationsServer('common.seo', locale);

  return buildMetadata({ locale: toLocale(locale), path: ROUTES.HOME, description: t('description') });
}

export default function Page() {
  return <HomePage />;
}
