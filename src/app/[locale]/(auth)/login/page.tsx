import type { Metadata } from 'next';

import { ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { toLocale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import LoginPage from '@/modules/login-page';
import type { PageProps } from '@/types/type';

export async function generateMetadata({ params }: Pick<PageProps<{ locale: string }>, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await useTranslationsServer('common.seo', locale);

  return buildMetadata({
    locale: toLocale(locale),
    path: ROUTES.LOGIN,
    title: t('login'),
    description: t('description'),
  });
}

export default function Page() {
  return <LoginPage />;
}
