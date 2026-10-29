import { redirect } from '@/i18n/navigation';
import { ROUTES } from '@/constants/routes';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return redirect({ href: ROUTES.ITEM1, locale });
}
