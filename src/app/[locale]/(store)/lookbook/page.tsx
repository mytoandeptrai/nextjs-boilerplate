import type { Metadata } from 'next';

import { getCategories } from '@/api/catalog/requests';
import { ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { toLocale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import type { PageProps } from '@/types/type';
import LookbookPage from '@/modules/lookbook-page';

export async function generateMetadata({ params, searchParams }: PageProps<{ locale: string }>): Promise<Metadata> {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const { t } = await useTranslationsServer('common.seo', locale);
  const category =
    typeof query.category === 'string'
      ? (await getCategories()).find((item) => item.slug === query.category)
      : undefined;

  return buildMetadata({
    locale: toLocale(locale),
    path: ROUTES.LOOKBOOK,
    query: { category: category?.slug },
    title: category ? t('lookbookCategory', { category: category.title }) : t('lookbook'),
    description: category ? t('lookbookCategoryDescription', { category: category.title }) : t('lookbookDescription'),
  });
}

export default async function Page({ searchParams }: PageProps<{ locale: string }>) {
  const { category } = await searchParams;

  return <LookbookPage categorySlug={typeof category === 'string' ? category : undefined} />;
}
