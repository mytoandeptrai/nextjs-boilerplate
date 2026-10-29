import type { MetadataRoute } from 'next';

import { env, isProductionEnv } from '@/constants/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: isProductionEnv ? { userAgent: '*', allow: '/', disallow: ['/api/'] } : { userAgent: '*', disallow: '/' },
    sitemap: `${env.APP_URL}/sitemap.xml`,
    host: env.APP_URL,
  };
}
