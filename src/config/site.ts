import { env, isProductionEnv } from '@/constants/env';

export type SiteConfig = typeof siteConfig;

export { isProductionEnv };

/** Locale-independent site facts. Localised copy lives in `src/messages/<locale>/common.json`. */
export const siteConfig = {
  appUrl: env.APP_URL,
  name: 'Màn Rèm Thùy Hương',
  shortName: 'Thùy Hương',
  description: 'Rèm cửa may đo cao cấp: rèm vải, rèm cuốn, rèm cầu vồng, rèm gỗ.',
  ogImage: `${env.APP_URL}/og-image.jpg`,
  themeColor: '#FAF9F6',
};
