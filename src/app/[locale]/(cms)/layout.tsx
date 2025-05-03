import type { Metadata, Viewport } from 'next';
import '../../globals.css';
import Providers from '../../providers';
import { AuthRedirect } from '@/components/shared';
import { fontMono, fontSans, siteConfig } from '@/constants';
import { cn } from '@/libs/utils';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.appUrl || 'http://localhost:3000'),
  title: siteConfig.name,
  description: siteConfig.description,
  generator: 'Next.js',
  applicationName: siteConfig.name,
  referrer: 'origin-when-cross-origin',
  keywords: [],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    images: [siteConfig.ogImage],
    description: siteConfig.description,
    title: {
      default: siteConfig.name,
      template: `${siteConfig.name} - %s`,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-96x96.png',
    apple: '/apple-touch-icon.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: `@${siteConfig.name}`,
  },
};

export const viewport: Viewport = {
  width: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return (
    <html lang='en'>
      <body suppressHydrationWarning className={cn(`antialiased`, fontSans.variable, fontMono.variable)}>
        <Providers locale={locale}>
          <AuthRedirect>{children}</AuthRedirect>
        </Providers>
      </body>
    </html>
  );
}
