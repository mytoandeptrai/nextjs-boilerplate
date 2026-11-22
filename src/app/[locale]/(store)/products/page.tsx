import type { Metadata } from 'next';

import { getCategories, getProductsPage } from '@/api/catalog/requests';
import { ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { toLocale } from '@/i18n/routing';
import { parsePage } from '@/lib/pagination';
import { parseProductSort, PRODUCTS_PAGE_SIZE } from '@/lib/product-listing';
import { buildMetadata } from '@/lib/seo';
import type { PageProps } from '@/types/type';
import ProductsPage from '@/modules/products-page';

/**
 * A category and a page number list different products, so they are part of the title and of the canonical URL.
 * The sort order only rearranges them: every order points at the same canonical page. A page past the end shows
 * the first page, so it is described as the first page too.
 */
export async function generateMetadata({ params, searchParams }: PageProps<{ locale: string }>): Promise<Metadata> {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const { t } = await useTranslationsServer('common.seo', locale);
  const category =
    typeof query.category === 'string'
      ? (await getCategories()).find((item) => item.slug === query.category)
      : undefined;
  const requestedPage = parsePage(query.page);
  const isPastEnd =
    requestedPage > 1 &&
    (await getProductsPage({ categoryId: category?.id, page: requestedPage, pageSize: PRODUCTS_PAGE_SIZE })).products
      .length === 0;
  const page = isPastEnd ? 1 : requestedPage;
  const title = category?.title ?? t('products');

  return buildMetadata({
    locale: toLocale(locale),
    path: ROUTES.PRODUCTS,
    query: { category: category?.slug, page: page > 1 ? page : undefined },
    title: page > 1 ? `${title} - ${t('page', { page })}` : title,
    description: category ? t('productsCategoryDescription', { category: category.title }) : t('productsDescription'),
  });
}

export default async function Page({ searchParams }: PageProps<{ locale: string }>) {
  const { category, page, sort } = await searchParams;

  return (
    <ProductsPage
      categorySlug={typeof category === 'string' ? category : undefined}
      page={parsePage(page)}
      sort={parseProductSort(sort)}
    />
  );
}
