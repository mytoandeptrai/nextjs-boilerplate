import { getCategories, getLookbooksByProduct, getProducts } from '@/api/catalog/requests';
import { ProductCard } from '@/components/store/product-card';
import { DiscountBadge, ProductPrice } from '@/components/store/product-price';
import { StoreImage } from '@/components/store/store-image';
import { ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { Link } from '@/i18n/navigation';
import type { IProduct } from '@/types/catalog';
import { Configurator } from './configurator';
import { ProductGallery } from './product-gallery';

export default async function ProductDetailPage({ product }: { product: IProduct }) {
  const { t } = await useTranslationsServer();
  const [categories, lookbooks, siblings] = await Promise.all([
    getCategories(),
    getLookbooksByProduct(product.id),
    getProducts({ categoryId: product.category_id ?? undefined, limit: 5 }),
  ]);
  const category = categories.find((item) => item.id === product.category_id);
  const related = siblings.filter((item) => item.id !== product.id).slice(0, 4);
  const unit = (item: IProduct) =>
    item.pricing_type === 'linear_meter' ? t('store.product.perMeter') : t('store.product.perSquareMeter');
  const priceLabels = (item: IProduct) => ({
    from: t('store.product.from'),
    unit: unit(item),
    originalPrice: t('store.product.originalPrice'),
  });

  return (
    <div className='container-page pt-6 lg:pt-10'>
      <nav aria-label='Breadcrumb' className='text-muted-foreground mb-6 text-xs'>
        <ol className='flex flex-wrap items-center gap-2'>
          <li>
            <Link href={ROUTES.HOME} className='hover:text-foreground'>
              {t('nav.home')}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={ROUTES.PRODUCTS} className='hover:text-foreground'>
              {t('nav.products')}
            </Link>
          </li>
          {category ? (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link href={`${ROUTES.PRODUCTS}?category=${category.slug}`} className='hover:text-foreground'>
                  {category.title}
                </Link>
              </li>
            </>
          ) : null}
        </ol>
      </nav>

      <div className='grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16'>
        <div className='lg:sticky lg:top-28 lg:self-start'>
          <ProductGallery images={product.images} title={product.title} />
        </div>

        <div>
          {category ? <p className='eyebrow mb-3'>{category.title}</p> : null}
          <h1 className='text-3xl font-light tracking-tight lg:text-4xl'>{product.title}</h1>
          <div className='mt-3 flex flex-wrap items-center gap-3'>
            <ProductPrice product={product} labels={priceLabels(product)} priceClassName='text-lg' />
            <DiscountBadge product={product} />
          </div>

          <div className='border-border mt-8 border-t pt-8'>
            <h2 className='sr-only'>{t('store.configurator.title')}</h2>
            <Configurator product={product} />
          </div>

          {product.description ? (
            <section className='border-border mt-10 border-t pt-8'>
              <h2 className='mb-3 text-sm font-medium tracking-[0.15em] uppercase'>{t('store.product.description')}</h2>
              <p className='text-muted-foreground leading-7 whitespace-pre-line'>{product.description}</p>
            </section>
          ) : null}
        </div>
      </div>

      {lookbooks.length > 0 ? (
        <section className='pt-20'>
          <h2 className='text-2xl font-light tracking-tight'>{t('store.product.seenInHomes')}</h2>
          <ul className='mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4'>
            {lookbooks.map((lookbook) => (
              <li key={lookbook.id} className='bg-muted relative aspect-[4/3] overflow-hidden'>
                <StoreImage src={lookbook.image_url} alt={lookbook.title} sizes='(min-width: 768px) 33vw, 50vw' />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className='pt-20'>
          <h2 className='text-2xl font-light tracking-tight'>{t('store.product.related')}</h2>
          <ul className='mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6'>
            {related.map((item) => (
              <li key={item.id}>
                <ProductCard product={item} labels={priceLabels(item)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
