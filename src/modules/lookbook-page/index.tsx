import { getCategories, getLookbooks, getProductsByIds } from '@/api/catalog/requests';
import { CategoryFilter } from '@/components/store/category-filter';
import { SectionHeading } from '@/components/store/section-heading';
import { ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { filterLookbooks, UNCATEGORISED_SLUG } from '@/lib/lookbook-filter';
import { type ILookbookEntry, LookbookGrid } from './lookbook-grid';

export default async function LookbookPage({ categorySlug }: { categorySlug?: string }) {
  const { t } = await useTranslationsServer();
  const [all, allCategories] = await Promise.all([getLookbooks(), getCategories()]);
  const { categories, hasUncategorised, active, isUncategorisedActive, lookbooks } = filterLookbooks(
    all,
    allCategories,
    categorySlug
  );
  const filters = [
    { href: ROUTES.LOOKBOOK, label: t('store.categories.all'), isActive: !active && !isUncategorisedActive },
    ...categories.map((category) => ({
      href: `${ROUTES.LOOKBOOK}?category=${category.slug}`,
      label: category.title,
      isActive: category.id === active?.id,
    })),
    ...(hasUncategorised
      ? [
          {
            href: `${ROUTES.LOOKBOOK}?category=${UNCATEGORISED_SLUG}`,
            label: t('store.categories.other'),
            isActive: isUncategorisedActive,
          },
        ]
      : []),
  ];
  const products = await getProductsByIds([...new Set(lookbooks.flatMap((lookbook) => lookbook.tagged_product_ids))]);
  const byId = new Map(products.map((product) => [product.id, product]));
  const entries: ILookbookEntry[] = lookbooks.map((lookbook) => ({
    ...lookbook,
    products: lookbook.tagged_product_ids.flatMap((id) => {
      const product = byId.get(id);

      return product
        ? [{ id: product.id, slug: product.slug, title: product.title, image: product.images[0] ?? null }]
        : [];
    }),
  }));

  return (
    <div className='container-page pt-12 lg:pt-16'>
      <SectionHeading
        as='h1'
        eyebrow={t('store.lookbook.eyebrow')}
        title={t('store.lookbook.title')}
        subtitle={t('store.lookbook.subtitle')}
      />
      {categories.length > 0 ? <CategoryFilter label={t('store.categories.title')} items={filters} /> : null}
      {entries.length > 0 ? (
        <LookbookGrid entries={entries} />
      ) : (
        <p className='border-border text-muted-foreground mt-10 border border-dashed py-20 text-center'>
          {t('store.lookbook.empty')}
        </p>
      )}
    </div>
  );
}
