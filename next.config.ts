import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// On Vercel's production deployment the public origin and environment default to the project's production domain,
// so canonical URLs, the sitemap and indexing are right even when the two variables were not set by hand.
const isVercelProduction = process.env.VERCEL_ENV === 'production';
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

if (isVercelProduction) process.env.NEXT_PUBLIC_APP_ENV ||= 'production';
if (isVercelProduction && vercelHost) process.env.NEXT_PUBLIC_APP_URL ||= `https://${vercelHost}`;

// Vercel only serves HTTPS, so an origin configured there as http:// would put the wrong scheme in canonical URLs
// and the sitemap, and would leave the admin cookies without the Secure flag.
if (process.env.VERCEL && process.env.NEXT_PUBLIC_APP_URL?.startsWith('http://'))
  process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL.replace('http://', 'https://');

const isProductionEnv = process.env.NEXT_PUBLIC_APP_ENV === 'production';

// Only images from this project's public storage bucket may go through the image optimizer.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
const storagePattern =
  supabaseUrl && storageBucket ? [new URL(`${supabaseUrl}/storage/v1/object/public/${storageBucket}/**`)] : [];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'standalone',
  // Inlined in the browser bundle too, including the Vercel defaults above.
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV ?? '',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? '',
  },
  experimental: { globalNotFound: true },
  images: {
    remotePatterns: storagePattern,
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85],
    // Uploaded objects have random names and never change.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
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
