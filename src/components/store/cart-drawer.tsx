'use client';

import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';

import { CartLineItem } from '@/components/store/cart-line-item';
import { CheckoutDialog } from '@/components/store/checkout-dialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ROUTES } from '@/constants/routes';
import { useCartLines, useTranslations } from '@/hooks';
import { Link } from '@/i18n/navigation';
import { formatVnd } from '@/lib/format';
import { useCartStore } from '@/stores';

/** Slide-over cart, opened from the header and after "add to cart". Mounted once in the store layout. */
export function CartDrawer() {
  const { t } = useTranslations('store');
  const isOpen = useCartStore((state) => state.isOpen);
  const setOpen = useCartStore((state) => state.setOpen);
  const { lines, total, count, hasUnavailable } = useCartLines(isOpen);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const _close = () => setOpen(false);
  const _checkout = () => {
    setOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent className='w-full gap-0 sm:max-w-md' data-testid='cart-drawer'>
          <SheetHeader className='border-border border-b px-6 py-5'>
            <SheetTitle className='text-xl font-light'>{t('cart.title')}</SheetTitle>
            <SheetDescription>{t('cart.itemCount', { count })}</SheetDescription>
          </SheetHeader>

          {lines.length === 0 ? (
            <div className='flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center'>
              <ShoppingBag className='text-muted-foreground size-10' strokeWidth={1} aria-hidden />
              <p className='font-medium'>{t('cart.empty')}</p>
              <p className='text-muted-foreground text-sm'>{t('cart.emptyHint')}</p>
              <Button asChild variant='outline' className='mt-3 rounded-none' onClick={_close}>
                <Link href={ROUTES.PRODUCTS}>{t('cart.continueShopping')}</Link>
              </Button>
            </div>
          ) : (
            <>
              <ul className='divide-border flex-1 divide-y overflow-y-auto px-6'>
                {lines.map((line) => (
                  <CartLineItem key={line.item.id} line={line} onNavigate={_close} />
                ))}
              </ul>
              <div className='border-border border-t px-6 py-5'>
                <div className='flex items-baseline justify-between'>
                  <span className='text-sm'>{t('cart.total')}</span>
                  <span className='text-xl font-medium tabular-nums'>{formatVnd(total)}</span>
                </div>
                <p className='text-muted-foreground mt-1 text-xs leading-5'>{t('cart.estimateNote')}</p>
                <Button
                  size='lg'
                  className='mt-4 h-12 w-full rounded-none'
                  disabled={hasUnavailable}
                  onClick={_checkout}
                >
                  {t('cart.checkout')}
                </Button>
                <Button asChild variant='ghost' className='mt-2 w-full rounded-none' onClick={_close}>
                  <Link href={ROUTES.CART}>{t('cart.viewCart')}</Link>
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <CheckoutDialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />
    </>
  );
}
