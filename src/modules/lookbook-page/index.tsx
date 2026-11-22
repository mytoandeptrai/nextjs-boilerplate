import { getLookbooks, getProductsByIds } from '@/api/catalog/requests';
import { SectionHeading } from '@/components/store/section-heading';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { type ILookbookEntry, LookbookGrid } from './lookbook-grid';

export default async function LookbookPage() {
  const { t } = await useTranslationsServer('store.lookbook');
  const lookbooks = await getLookbooks();
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
      <SectionHeading as='h1' eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />
      {entries.length > 0 ? (
        <LookbookGrid entries={entries} />
      ) : (
        <p className='border-border text-muted-foreground mt-10 border border-dashed py-20 text-center'>{t('empty')}</p>
      )}
    </div>
  );
}
