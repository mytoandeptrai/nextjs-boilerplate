import { env } from './env.const';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  appUrl: env.APP_URL,
  name: 'Jacob',
  metaTitle: 'Jacob',
  description: 'Jacob Template',
  ogImage: `${env.APP_URL}/og-image.jpg`,
};
