import { siteConfig } from '@/config/site';
import { createOgImage } from '@/lib/og-image';

export const dynamic = 'force-static';

// One locale-agnostic image: it lives outside `[locale]`, so its URL never needs a locale prefix (no redirect for crawlers).
export function GET() {
  return createOgImage({ title: siteConfig.name, description: siteConfig.description });
}
