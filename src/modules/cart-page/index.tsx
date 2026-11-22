'use client';

import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';

import { CartLineItem } from '@/components/store/cart-line-item';
import { CheckoutDialog } from '@/components/store/checkout-dialog';
import { useStore } from '@/components/store/store-provider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { useCartLines, useTranslations } from '@/hooks';
import { Link } from '@/i18n/navigation';
import { formatVnd } from '@/lib/format';

export default function CartPage() {
  const { t } = useTranslations('store.cart');
  const { isCartReady } = useStore();
  const { lines, total, count, hasUnavailable } = useCartLines();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const _renderBody = () => {
    if (!isCartReady)
      return (
        <div className='mt-10 space-y-4' aria-busy>
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
        </div>
      );

    if (lines.length === 0)
      return (
        <div className='border-border mt-10 flex flex-col items-center gap-3 border border-dashed px-6 py-20 text-center'>
          <ShoppingBag className='text-muted-foreground size-10' strokeWidth={1} aria-hidden />
          <p className='font-medium'>{t('empty')}</p>
          <p className='text-muted-foreground text-sm'>{t('emptyHint')}</p>
          <Button asChild className='mt-3 h-12 rounded-none px-8'>
            <Link href={ROUTES.PRODUCTS}>{t('continueShopping')}</Link>
          </Button>
        </div>
      );

    return (
      <div className='mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16'>
        <ul className='divide-border border-border h-fit divide-y border-y'>
          {lines.map((line) => (
            <CartLineItem key={line.item.id} line={line} />
          ))}
        </ul>

        <aside className='bg-secondary/70 h-fit p-6 lg:sticky lg:top-28'>
          <h2 className='text-sm font-medium tracking-[0.15em] uppercase'>{t('summary')}</h2>
          <p className='text-muted-foreground mt-4 text-sm'>{t('itemCount', { count })}</p>
          <div className='border-border mt-4 flex items-baseline justify-between border-t pt-4'>
            <span className='text-sm'>{t('total')}</span>
            <span className='text-2xl font-light tabular-nums' data-testid='cart-total'>
              {formatVnd(total)}
            </span>
          </div>
          <p className='text-muted-foreground mt-2 text-xs leading-5'>{t('estimateNote')}</p>
          <Button
            size='lg'
            className='mt-6 h-12 w-full rounded-none'
            disabled={hasUnavailable}
            onClick={() => setIsCheckoutOpen(true)}
          >
            {t('checkout')}
          </Button>
          <Button asChild variant='ghost' className='mt-2 w-full rounded-none'>
            <Link href={ROUTES.PRODUCTS}>{t('continueShopping')}</Link>
          </Button>
        </aside>
      </div>
    );
  };

  return (
    <div className='container-page pt-12 lg:pt-16'>
      <h1 className='text-3xl font-light tracking-tight sm:text-4xl'>{t('title')}</h1>

      {_renderBody()}

      <CheckoutDialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />
    </div>
  );
}
