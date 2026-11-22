import type { Metadata } from 'next';

import { useTranslationsServer } from '@/hooks/use-translations-server';
import { getRobots } from '@/lib/seo';
import AdminLayout from '@/modules/admin-layout';
import type { LayoutProps } from '@/types/type';

export async function generateMetadata({ params }: Pick<LayoutProps<{ locale: string }>, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await useTranslationsServer('common.seo', locale);

  return { title: t('admin'), robots: getRobots(true) };
}

export default async function Layout({ children, params }: LayoutProps<{ locale: string }>) {
  const { locale } = await params;

  return <AdminLayout locale={locale}>{children}</AdminLayout>;
}
