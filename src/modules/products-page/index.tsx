import { getCategories, getProducts } from '@/api/catalog/requests';
import { CategoryFilter } from '@/components/store/category-filter';
import { ProductCard } from '@/components/store/product-card';
import { SectionHeading } from '@/components/store/section-heading';
import { ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';

export default async function ProductsPage({ categorySlug }: { categorySlug?: string }) {
  const { t } = await useTranslationsServer();
  const categories = await getCategories();
  // An unknown slug shows everything instead of an empty page.
  const active = categories.find((category) => category.slug === categorySlug);
  const products = await getProducts({ categoryId: active?.id });
  const categoryTitle = new Map(categories.map((category) => [category.id, category.title]));
  const filters = [
    { href: ROUTES.PRODUCTS, label: t('store.categories.all'), isActive: !active },
    ...categories.map((category) => ({
      href: `${ROUTES.PRODUCTS}?category=${category.slug}`,
      label: category.title,
      isActive: category.id === active?.id,
    })),
  ];

  return (
    <div className='container-page pt-12 lg:pt-16'>
      <SectionHeading
        as='h1'
        eyebrow={t('store.product.madeToMeasure')}
        title={active?.title ?? t('common.seo.products')}
        subtitle={t('common.seo.productsDescription')}
      />

      <CategoryFilter label={t('store.categories.title')} items={filters} />

      {products.length > 0 ? (
        <ul className='mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6'>
          {products.map((product, index) => (
            <li key={product.id}>
              <ProductCard
                product={product}
                eager={index < 4}
                categoryTitle={product.category_id ? categoryTitle.get(product.category_id) : undefined}
                labels={{
                  from: t('store.product.from'),
                  unit:
                    product.pricing_type === 'linear_meter'
                      ? t('store.product.perMeter')
                      : t('store.product.perSquareMeter'),
                }}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className='border-border text-muted-foreground mt-10 border border-dashed py-20 text-center'>
          {t('store.product.empty')}
        </p>
      )}
    </div>
  );
}
