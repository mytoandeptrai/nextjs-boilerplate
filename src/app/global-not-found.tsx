import type { Metadata } from 'next';

import { siteConfig } from '@/config/site';

export const metadata: Metadata = { metadataBase: new URL(siteConfig.appUrl) };

// Fallback for URLs outside any locale segment (the locale layout is not available here).
export default function RootNotFound() {
  return (
    <html lang='en'>
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', margin: 0 }}>404</h1>
          <p>Page not found</p>
        </div>
      </body>
    </html>
  );
}
