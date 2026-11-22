import type { Metadata } from 'next';

import { ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { toLocale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import CartPage from '@/modules/cart-page';
import type { PageProps } from '@/types/type';

export async function generateMetadata({ params }: Pick<PageProps<{ locale: string }>, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await useTranslationsServer('common.seo', locale);

  // The cart is personal: keep it out of search results.
  return buildMetadata({ locale: toLocale(locale), path: ROUTES.CART, title: t('cart'), noIndex: true });
}

export default function Page() {
  return <CartPage />;
}
