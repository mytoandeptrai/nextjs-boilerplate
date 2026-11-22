import type { Metadata } from 'next';

import { ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { toLocale } from '@/i18n/routing';
import { parsePage } from '@/lib/pagination';
import { buildMetadata } from '@/lib/seo';
import type { PageProps } from '@/types/type';
import ProductsPage from '@/modules/products-page';

export async function generateMetadata({ params }: Pick<PageProps<{ locale: string }>, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await useTranslationsServer('common.seo', locale);

  return buildMetadata({
    locale: toLocale(locale),
    path: ROUTES.PRODUCTS,
    title: t('products'),
    description: t('productsDescription'),
  });
}

export default async function Page({ searchParams }: PageProps<{ locale: string }>) {
  const { category, page } = await searchParams;

  return <ProductsPage categorySlug={typeof category === 'string' ? category : undefined} page={parsePage(page)} />;
}
