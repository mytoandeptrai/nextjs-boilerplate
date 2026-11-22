import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { toLocale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import AdminLoginPage from '@/modules/admin-login-page';
import type { PageProps } from '@/types/type';

export async function generateMetadata({ params }: Pick<PageProps<{ locale: string }>, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await useTranslationsServer('common.seo', locale);

  return buildMetadata({ locale: toLocale(locale), path: ROUTES.ADMIN_LOGIN, title: t('adminLogin'), noIndex: true });
}

export default function Page() {
  // `useSearchParams` (the `next` destination) needs a Suspense boundary to keep the page prerenderable.
  return (
    <Suspense>
      <AdminLoginPage />
    </Suspense>
  );
}
