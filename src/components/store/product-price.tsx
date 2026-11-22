import { formatVnd } from '@/lib/format';
import { getDiscountPercent, getEffectivePrice } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import type { IProduct } from '@/types/catalog';

interface IProductPriceProps {
  product: Pick<IProduct, 'base_price' | 'sale_price'>;
  /** Already translated: "From", the unit suffix and "Original price" (read out before the struck-through price). */
  labels: { from: string; unit: string; originalPrice: string };
  className?: string;
  priceClassName?: string;
}

/** "From 450.000đ / m", with the original price struck through when the product is discounted. */
export function ProductPrice({ product, labels, className, priceClassName }: IProductPriceProps) {
  const isDiscounted = getDiscountPercent(product) > 0;

  return (
    <p className={cn('text-muted-foreground', className)}>
      {labels.from}{' '}
      <span className={cn('font-medium', isDiscounted ? 'text-sale' : 'text-foreground', priceClassName)}>
        {formatVnd(getEffectivePrice(product))}
      </span>{' '}
      {isDiscounted ? (
        <>
          <span className='sr-only'>{labels.originalPrice}</span>
          <s className='tabular-nums'>{formatVnd(product.base_price)}</s>{' '}
        </>
      ) : null}
      {labels.unit}
    </p>
  );
}

/** "-15%" tag; nothing when the product is not discounted. */
export function DiscountBadge({
  product,
  className,
}: {
  product: Pick<IProduct, 'base_price' | 'sale_price'>;
  className?: string;
}) {
  const percent = getDiscountPercent(product);

  if (percent <= 0) return null;

  return (
    <span
      data-testid='discount-badge'
      className={cn('bg-sale px-2 py-1 text-xs font-medium tracking-wide text-white tabular-nums', className)}
    >
      -{percent}%
    </span>
  );
}
