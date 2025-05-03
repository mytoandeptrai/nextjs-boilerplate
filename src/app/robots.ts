import type { MetadataRoute } from 'next';
import { siteConfig } from '@/constants';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: `${siteConfig.appUrl}/sitemap.xml`,
  };
}
