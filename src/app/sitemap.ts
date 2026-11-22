import type { MetadataRoute } from 'next';

import { getCategories, getPosts, getProducts } from '@/api/catalog/requests';
import { buildRoute, INDEXABLE_ROUTES, ROUTES } from '@/constants/routes';
import { routing } from '@/i18n/routing';
import { getAbsoluteUrl, getLanguageAlternates, toQueryString } from '@/lib/seo';

export const revalidate = 3600;

interface Entry {
  route: string;
  search?: string;
  priority: number;
  lastModified?: Date;
  images?: string[];
}

const toDate = (value: string | null | undefined) => (value ? new Date(value) : undefined);

/**
 * Static storefront routes, one catalogue page per category that has products, every active product (with its
 * photos) and every published guide. The admin portal and the cart are never listed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, posts] = await Promise.all([getCategories(), getProducts(), getPosts()]);
  const newestProduct = toDate(products[0]?.created_at);
  const entries: Entry[] = [
    ...INDEXABLE_ROUTES.map((route) => ({
      route,
      priority: route === ROUTES.HOME ? 1 : 0.8,
      lastModified: route === ROUTES.BLOG ? toDate(posts[0]?.published_at) : newestProduct,
    })),
    ...categories
      .filter((category) => products.some((product) => product.category_id === category.id))
      .map((category) => ({
        route: ROUTES.PRODUCTS,
        search: toQueryString({ category: category.slug }),
        priority: 0.7,
        lastModified: newestProduct,
      })),
    ...products.map((product) => ({
      route: buildRoute(ROUTES.PRODUCT_DETAIL, { slug: product.slug }),
      priority: 0.7,
      lastModified: toDate(product.created_at),
      images: product.images,
    })),
    ...posts.map((post) => ({
      route: buildRoute(ROUTES.BLOG_POST, { slug: post.slug }),
      priority: 0.5,
      lastModified: toDate(post.published_at),
      images: post.thumbnail_url ? [post.thumbnail_url] : undefined,
    })),
  ];

  return entries.flatMap(({ route, search = '', priority, lastModified, images }) =>
    routing.locales.map((locale) => ({
      url: `${getAbsoluteUrl(locale, route)}${search}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority,
      alternates: { languages: getLanguageAlternates(route, search) },
      images,
    }))
  );
}
