import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site';
import { INDEXABLE_ROUTES } from '@/constants/routes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return INDEXABLE_ROUTES.map((route) => ({
    url: `${siteConfig.appUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 1,
  }));
}
