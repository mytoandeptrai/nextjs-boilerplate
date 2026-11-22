import { env, isProductionEnv } from '@/constants/env';

export type SiteConfig = typeof siteConfig;

export { isProductionEnv };

/** Locale-independent site facts. Localised copy lives in `src/messages/<locale>/common.json`. */
export const siteConfig = {
  appUrl: env.APP_URL,
  name: 'Màn Rèm Thùy Hương',
  shortName: 'Thùy Hương',
  tagline: 'Rèm cửa may đo cao cấp',
  description: 'Rèm vải, rèm cuốn, rèm cầu vồng, rèm gỗ may đo theo kích thước cửa nhà bạn.',
  /** The shop's Facebook page, listed as `sameAs` in the structured data. */
  facebookUrl: 'https://www.facebook.com/ManRemThuyHuongcaocap',
  themeColor: '#FAF9F6',
};
