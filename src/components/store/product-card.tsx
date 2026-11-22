import { StoreImage } from '@/components/store/store-image';
import { buildRoute, ROUTES } from '@/constants/routes';
import { Link } from '@/i18n/navigation';
import { formatVnd } from '@/lib/format';
import type { IProduct } from '@/types/catalog';

interface IProductCardProps {
  product: IProduct;
  categoryTitle?: string;
  /** Already translated: "From" and the unit suffix for the product's pricing type. */
  labels: { from: string; unit: string };
  sizes?: string;
  /** First row of a listing: load the image at once. */
  eager?: boolean;
}

export function ProductCard({
  product,
  categoryTitle,
  labels,
  sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw',
  eager = false,
}: IProductCardProps) {
  return (
    <Link
      href={buildRoute(ROUTES.PRODUCT_DETAIL, { slug: product.slug })}
      className='group focus-visible:outline-ring block focus-visible:outline-2 focus-visible:outline-offset-4'
    >
      <div className='bg-muted relative aspect-[4/5] overflow-hidden'>
        <StoreImage
          src={product.images[0]}
          alt={product.title}
          sizes={sizes}
          eager={eager}
          className='transition-transform duration-700 ease-out group-hover:scale-105'
        />
      </div>
      <div className='pt-4'>
        {categoryTitle ? (
          <p className='text-muted-foreground mb-1 text-xs tracking-[0.15em] uppercase'>{categoryTitle}</p>
        ) : null}
        <h3 className='text-foreground group-hover:text-brand text-base leading-snug font-medium'>{product.title}</h3>
        <p className='text-muted-foreground mt-1 text-sm'>
          {labels.from} <span className='text-foreground font-medium'>{formatVnd(product.base_price)}</span>{' '}
          {labels.unit}
        </p>
      </div>
    </Link>
  );
}
