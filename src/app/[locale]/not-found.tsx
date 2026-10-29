import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const { t } = await useTranslationsServer('common.notFound');

  return (
    <section className='flex min-h-svh flex-col items-center justify-center gap-4 text-center'>
      <p className='text-6xl font-semibold tracking-tight'>404</p>
      <h1 className='text-xl font-semibold'>{t('title')}</h1>
      <p className='text-muted-foreground text-sm'>{t('description')}</p>
      <Button asChild>
        <Link href={ROUTES.HOME}>{t('backHome')}</Link>
      </Button>
    </section>
  );
}
