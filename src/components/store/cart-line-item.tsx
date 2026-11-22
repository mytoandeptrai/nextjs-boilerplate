'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';

import { StoreImage } from '@/components/store/store-image';
import { CONFIGURATOR_LIMITS } from '@/constants/const';
import { buildRoute, ROUTES } from '@/constants/routes';
import { useTranslations, type ICartLine } from '@/hooks';
import { Link } from '@/i18n/navigation';
import { formatVnd } from '@/lib/format';
import { useCartStore } from '@/stores';

interface ICartLineItemProps {
  line: ICartLine;
  /** Called when the product link is followed (the drawer closes itself). */
  onNavigate?: () => void;
}

export function CartLineItem({ line: { item, isAvailable }, onNavigate }: ICartLineItemProps) {
  const { t } = useTranslations('store');
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const { min, max } = CONFIGURATOR_LIMITS.quantity;

  const specs = [
    `${t('cart.width')} ${item.widthCm}cm × ${t('cart.height')} ${item.heightCm}cm`,
    item.pleat?.label,
    item.pricingType === 'linear_meter' ? `${t('cart.fullness')} ${item.fullness}x` : null,
    item.fabric?.label,
    item.motor?.label ?? t('configurator.noMotor'),
  ].filter(Boolean);

  return (
    <li className='flex gap-4 py-5'>
      <Link
        href={buildRoute(ROUTES.PRODUCT_DETAIL, { slug: item.slug })}
        onClick={onNavigate}
        className='bg-muted relative size-24 shrink-0 overflow-hidden sm:size-28'
        tabIndex={-1}
        aria-hidden
      >
        <StoreImage src={item.image} alt='' sizes='112px' />
      </Link>

      <div className='flex min-w-0 flex-1 flex-col'>
        <div className='flex items-start justify-between gap-3'>
          <Link
            href={buildRoute(ROUTES.PRODUCT_DETAIL, { slug: item.slug })}
            onClick={onNavigate}
            className='text-foreground hover:text-brand text-sm leading-snug font-medium'
          >
            {item.title}
          </Link>
          <button
            type='button'
            onClick={() => removeItem(item.id)}
            aria-label={t('cart.remove', { title: item.title })}
            className='text-muted-foreground hover:text-destructive -m-2 shrink-0 p-2 transition-colors'
          >
            <Trash2 className='size-4' aria-hidden />
          </button>
        </div>

        <p className='text-muted-foreground mt-1 text-xs leading-5'>{specs.join(' · ')}</p>

        {isAvailable ? (
          <div className='mt-auto flex items-end justify-between gap-3 pt-3'>
            <div className='border-input inline-flex items-center border'>
              <button
                type='button'
                onClick={() => setQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= min}
                aria-label={t('configurator.decrease')}
                className='text-foreground flex size-9 items-center justify-center disabled:opacity-30'
              >
                <Minus className='size-3.5' aria-hidden />
              </button>
              <span className='w-8 text-center text-sm tabular-nums' aria-live='polite'>
                {item.quantity}
              </span>
              <button
                type='button'
                onClick={() => setQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= max}
                aria-label={t('configurator.increase')}
                className='text-foreground flex size-9 items-center justify-center disabled:opacity-30'
              >
                <Plus className='size-3.5' aria-hidden />
              </button>
            </div>
            <div className='text-right'>
              <p className='text-foreground text-sm font-medium tabular-nums'>
                {formatVnd(item.unitPrice * item.quantity)}
              </p>
              {item.quantity > 1 ? (
                <p className='text-muted-foreground text-xs tabular-nums'>
                  {t('cart.each', { price: formatVnd(item.unitPrice) })}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <p role='alert' className='text-destructive mt-3 text-xs leading-5'>
            {t('cart.unavailable')}
          </p>
        )}
      </div>
    </li>
  );
}
