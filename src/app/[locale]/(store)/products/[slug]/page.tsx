import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { getCategories, getProductBySlug } from '@/api/catalog/requests';
import { JsonLd } from '@/components/seo/json-ld';
import { buildRoute, ROUTES } from '@/constants/routes';
import { getExcerpt } from '@/lib/markdown';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { toLocale } from '@/i18n/routing';
import { getEffectivePrice } from '@/lib/pricing';
import { breadcrumbJsonLd, buildMetadata, getAbsoluteUrl, productJsonLd, toQueryString } from '@/lib/seo';
import ProductDetailPage from '@/modules/product-detail-page';
import type { PageProps } from '@/types/type';

type Props = PageProps<{ locale: string; slug: string }>;

export const revalidate = 60;

// `generateMetadata` and the page share one database read per request.
const getProduct = cache(getProductBySlug);

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);

  if (!product) return {};

  const image = product.images[0];

  return buildMetadata({
    locale: toLocale(locale),
    path: buildRoute(ROUTES.PRODUCT_DETAIL, { slug }),
    title: product.title,
    description: getExcerpt(product.description) || undefined,
    image: image ? { url: image, alt: product.title } : undefined,
  });
}

export default async function Page({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const locale = toLocale(rawLocale);
  const [{ t }, categories] = await Promise.all([useTranslationsServer('common.seo', locale), getCategories()]);
  const category = categories.find((item) => item.id === product.category_id);
  const url = getAbsoluteUrl(locale, buildRoute(ROUTES.PRODUCT_DETAIL, { slug }));
  const productsUrl = getAbsoluteUrl(locale, ROUTES.PRODUCTS);

  return (
    <>
      <JsonLd
        data={productJsonLd({
          url,
          name: product.title,
          description: product.description,
          images: product.images,
          category: category?.title,
          price: getEffectivePrice(product),
          unitCode: product.pricing_type === 'square_meter' ? 'MTK' : 'MTR',
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t('home'), url: getAbsoluteUrl(locale) },
          { name: t('products'), url: productsUrl },
          ...(category
            ? [{ name: category.title, url: `${productsUrl}${toQueryString({ category: category.slug })}` }]
            : []),
          { name: product.title, url },
        ])}
      />
      <ProductDetailPage product={product} />
    </>
  );
}
