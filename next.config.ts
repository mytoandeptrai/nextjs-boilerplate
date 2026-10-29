import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const isProductionEnv = process.env.NEXT_PUBLIC_APP_ENV === 'production';

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'standalone',
  experimental: { globalNotFound: true },
  async headers() {
    const security = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];
    // Keep non-production environments out of search engines.
    const noindex = isProductionEnv ? [] : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }];

    return [{ source: '/:path*', headers: [...security, ...noindex] }];
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
