import { getCategories, getProductsPage } from '@/api/catalog/requests';
import { CategoryFilter } from '@/components/store/category-filter';
import { Pagination } from '@/components/store/pagination';
import { ProductCard } from '@/components/store/product-card';
import { SectionHeading } from '@/components/store/section-heading';
import { SortSelect } from '@/components/store/sort-select';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { getTotalPages } from '@/lib/pagination';
import { buildProductsHref, DEFAULT_PRODUCT_SORT, PRODUCT_SORTS, type ProductSort } from '@/lib/product-listing';

/** Three rows of four on desktop, six rows of two on a phone. */
const PRODUCTS_PAGE_SIZE = 12;

interface IProductsPageProps {
  categorySlug?: string;
  sort?: ProductSort;
  page?: number;
}

export default async function ProductsPage({
  categorySlug,
  sort = DEFAULT_PRODUCT_SORT,
  page = 1,
}: IProductsPageProps) {
  const { t } = await useTranslationsServer();
  const categories = await getCategories();
  // An unknown slug shows everything instead of an empty page.
  const active = categories.find((category) => category.slug === categorySlug);
  const query = { categoryId: active?.id, sort, pageSize: PRODUCTS_PAGE_SIZE };
  const requested = await getProductsPage({ ...query, page });
  // A page past the end (an old link, a product removed since) shows the first page instead of an empty one.
  const isPastEnd = page > 1 && requested.products.length === 0;
  const { products, total } = isPastEnd ? await getProductsPage({ ...query, page: 1 }) : requested;
  const currentPage = isPastEnd ? 1 : page;
  const categoryTitle = new Map(categories.map((category) => [category.id, category.title]));
  // Changing the category or the order starts again from the first page.
  const filters = [
    { href: buildProductsHref({ sort }), label: t('store.categories.all'), isActive: !active },
    ...categories.map((category) => ({
      href: buildProductsHref({ category: category.slug, sort }),
      label: category.title,
      isActive: category.id === active?.id,
    })),
  ];
  const sortOptions = PRODUCT_SORTS.map((value) => ({
    value,
    label: t(`store.sort.${value}`),
    href: buildProductsHref({ category: active?.slug, sort: value }),
  }));

  return (
    <div className='container-page pt-12 lg:pt-16'>
      <SectionHeading
        as='h1'
        eyebrow={t('store.product.madeToMeasure')}
        title={active?.title ?? t('common.seo.products')}
        subtitle={t('common.seo.productsDescription')}
      />

      <div className='sm:flex sm:items-end sm:justify-between sm:gap-6'>
        <CategoryFilter label={t('store.categories.title')} items={filters} />
        <div className='mt-4 sm:mt-8'>
          <SortSelect label={t('store.sort.label')} value={sort} options={sortOptions} />
        </div>
      </div>

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
                  originalPrice: t('store.product.originalPrice'),
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

      <Pagination
        page={currentPage}
        totalPages={getTotalPages(total, PRODUCTS_PAGE_SIZE)}
        getHref={(target) => buildProductsHref({ category: active?.slug, sort, page: target })}
        labels={{
          navigation: t('store.pagination.label'),
          previous: t('store.pagination.previous'),
          next: t('store.pagination.next'),
          page: (target) => t('store.pagination.page', { page: target }),
        }}
      />
    </div>
  );
}
