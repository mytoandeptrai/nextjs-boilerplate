'use client';

import { Menu, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

import { LogoMark } from '@/components/brand/logo';
import { useStore } from '@/components/store/store-provider';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { siteConfig } from '@/config/site';
import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/hooks';
import { Link, usePathname } from '@/i18n/navigation';
import { LOCALES } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { selectCartCount, useCartStore } from '@/stores';

const NAV = [
  { href: ROUTES.PRODUCTS, key: 'products' },
  { href: ROUTES.LOOKBOOK, key: 'lookbook' },
  { href: ROUTES.BLOG, key: 'blog' },
] as const;

function LocaleLinks({ className }: { className?: string }) {
  const { t, locale } = useTranslations('nav');
  const pathname = usePathname();

  return (
    <nav aria-label={t('language')} className={cn('flex items-center gap-1 text-xs', className)}>
      {LOCALES.map((code) => (
        <Link
          key={code}
          href={pathname}
          locale={code}
          hrefLang={code}
          aria-current={code === locale ? 'true' : undefined}
          className={cn(
            'px-1.5 py-1 tracking-widest uppercase transition-colors',
            code === locale ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {code}
        </Link>
      ))}
    </nav>
  );
}

export function SiteHeader() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const { isCartReady } = useStore();
  const count = useCartStore(selectCartCount);
  const openCart = useCartStore((state) => state.setOpen);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className='border-border bg-background/90 sticky top-0 z-40 border-b backdrop-blur-md'>
      <div className='container-page flex h-16 items-center justify-between gap-4 lg:h-20'>
        <div className='flex items-center gap-2 lg:hidden'>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger aria-label={t('nav.openMenu')} className='-ml-2 flex size-10 items-center justify-center'>
              <Menu className='size-5' strokeWidth={1.5} aria-hidden />
            </SheetTrigger>
            <SheetContent side='left' className='w-4/5 max-w-xs'>
              <SheetHeader className='border-border border-b px-6 py-5 text-left'>
                <SheetTitle className='text-base font-medium tracking-[0.2em] uppercase'>
                  {siteConfig.shortName}
                </SheetTitle>
                <SheetDescription>{t('store.brand.tagline')}</SheetDescription>
              </SheetHeader>
              <nav aria-label={t('nav.menu')} className='flex flex-col px-6'>
                {[{ href: ROUTES.HOME, key: 'home' } as const, ...NAV].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className='border-border border-b py-4 text-lg'
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                ))}
              </nav>
              <LocaleLinks className='px-5' />
            </SheetContent>
          </Sheet>
        </div>

        <Link href={ROUTES.HOME} className='flex items-center gap-3 leading-none' aria-label={siteConfig.name}>
          <LogoMark className='size-8 lg:size-10' />
          <span className='flex flex-col'>
            <span className='text-base font-medium tracking-[0.28em] uppercase lg:text-lg'>{siteConfig.shortName}</span>
            <span className='text-muted-foreground mt-1 hidden text-[10px] tracking-[0.3em] uppercase lg:block'>
              {t('store.brand.tagline')}
            </span>
          </span>
        </Link>

        <nav aria-label={t('nav.menu')} className='hidden items-center gap-10 lg:flex'>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'hover:text-brand border-b py-1 text-sm tracking-wide transition-colors',
                isActive(item.href) ? 'border-foreground' : 'border-transparent'
              )}
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className='flex items-center gap-3'>
          <LocaleLinks className='hidden lg:flex' />
          <button
            type='button'
            onClick={() => openCart(true)}
            aria-label={t('store.cart.open', { count: isCartReady ? count : 0 })}
            className='relative -mr-2 flex size-10 items-center justify-center'
            data-testid='cart-button'
          >
            <ShoppingBag className='size-5' strokeWidth={1.5} aria-hidden />
            {isCartReady && count > 0 ? (
              <span className='bg-brand text-brand-foreground absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium'>
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
