import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { getProductBySlug } from '@/api/catalog/requests';
import { JsonLd } from '@/components/seo/json-ld';
import { buildRoute, ROUTES } from '@/constants/routes';
import { toLocale } from '@/i18n/routing';
import { getEffectivePrice } from '@/lib/pricing';
import { buildMetadata, getAbsoluteUrl } from '@/lib/seo';
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

  const metadata = await buildMetadata({
    locale: toLocale(locale),
    path: buildRoute(ROUTES.PRODUCT_DETAIL, { slug }),
    title: product.title,
    description: product.description.slice(0, 160) || undefined,
  });
  const image = product.images[0];

  return image ? { ...metadata, openGraph: { ...metadata.openGraph, images: [image] } } : metadata;
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          description: product.description || undefined,
          image: product.images,
          url: getAbsoluteUrl(toLocale(locale), buildRoute(ROUTES.PRODUCT_DETAIL, { slug })),
          offers: {
            '@type': 'Offer',
            priceCurrency: 'VND',
            price: getEffectivePrice(product),
            availability: 'https://schema.org/InStock',
          },
        }}
      />
      <ProductDetailPage product={product} />
    </>
  );
}
