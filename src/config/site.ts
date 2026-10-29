import { env, isProductionEnv } from '@/constants/env';

export type SiteConfig = typeof siteConfig;

export { isProductionEnv };

/** Locale-independent site facts. Localised copy lives in `src/messages/<locale>/common.json`. */
export const siteConfig = {
  appUrl: env.APP_URL,
  name: 'Jacob',
  description: 'Jacob Template',
  ogImage: `${env.APP_URL}/og-image.jpg`,
};
