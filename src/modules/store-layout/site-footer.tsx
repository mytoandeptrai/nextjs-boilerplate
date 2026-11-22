import { siteConfig } from '@/config/site';
import { ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { Link } from '@/i18n/navigation';
import { buildZaloUrl } from '@/lib/zalo';

export async function SiteFooter({ zaloHotline }: { zaloHotline: string }) {
  const { t } = await useTranslationsServer();
  const zaloUrl = buildZaloUrl(zaloHotline);
  const links = [
    { href: ROUTES.PRODUCTS, label: t('nav.products') },
    { href: ROUTES.LOOKBOOK, label: t('nav.lookbook') },
    { href: ROUTES.BLOG, label: t('nav.blog') },
    { href: ROUTES.CART, label: t('nav.cart') },
  ];

  return (
    <footer className='border-border bg-secondary/60 mt-24 border-t'>
      <div className='container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]'>
        <div>
          <p className='text-base font-medium tracking-[0.28em] uppercase'>{siteConfig.shortName}</p>
          <p className='text-muted-foreground mt-4 max-w-sm text-sm leading-6'>{t('store.footer.about')}</p>
        </div>
        <nav aria-label={t('store.footer.explore')}>
          <p className='eyebrow mb-4'>{t('store.footer.explore')}</p>
          <ul className='space-y-2 text-sm'>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className='hover:text-brand'>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {zaloHotline ? (
          <div>
            <p className='eyebrow mb-4'>{t('store.footer.contact')}</p>
            <p className='text-muted-foreground text-sm'>{t('store.footer.hotline')}</p>
            <a href={`tel:${zaloHotline}`} className='hover:text-brand mt-1 block text-2xl font-light tracking-wide'>
              {zaloHotline}
            </a>
            {zaloUrl ? (
              <a
                href={zaloUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='border-foreground hover:border-brand hover:text-brand mt-3 inline-block border-b pb-0.5 text-sm'
              >
                {t('store.zalo.chat')}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className='border-border border-t'>
        <p className='container-page text-muted-foreground py-5 text-xs'>
          {t('store.footer.rights', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
