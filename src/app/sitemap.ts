import type { MetadataRoute } from 'next';

import { getPosts, getProducts } from '@/api/catalog/requests';
import { buildRoute, INDEXABLE_ROUTES, ROUTES } from '@/constants/routes';
import { routing } from '@/i18n/routing';
import { getAbsoluteUrl, getLanguageAlternates } from '@/lib/seo';

export const revalidate = 3600;

/** Static storefront routes plus every active product and published guide. The admin portal is never listed. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([getProducts(), getPosts()]);
  const routes = [
    ...INDEXABLE_ROUTES.map((route) => ({
      route,
      priority: route === ROUTES.HOME ? 1 : 0.8,
      lastModified: new Date(),
    })),
    ...products.map((product) => ({
      route: buildRoute(ROUTES.PRODUCT_DETAIL, { slug: product.slug }),
      priority: 0.7,
      lastModified: new Date(product.created_at || Date.now()),
    })),
    ...posts.map((post) => ({
      route: buildRoute(ROUTES.BLOG_POST, { slug: post.slug }),
      priority: 0.5,
      lastModified: new Date(post.published_at || Date.now()),
    })),
  ];

  return routes.flatMap(({ route, priority, lastModified }) =>
    routing.locales.map((locale) => ({
      url: getAbsoluteUrl(locale, route),
      lastModified,
      changeFrequency: 'weekly' as const,
      priority,
      alternates: { languages: getLanguageAlternates(route) },
    }))
  );
}
