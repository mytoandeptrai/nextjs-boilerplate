import { siteConfig } from '@/constants';
import type { MetadataRoute } from 'next';
import { ROUTES } from '@/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const staticPages: MetadataRoute.Sitemap = Object.values(ROUTES).map((route) => ({
      url: `${siteConfig.appUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    }));

    return staticPages;
  } catch (err) {
    return [];
  }
}
