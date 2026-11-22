import type { ICategory, ILookbook } from '@/types/catalog';

import { filterLookbooks, UNCATEGORISED_SLUG } from '../lookbook-filter';

const category = (id: string, slug: string, order: number): ICategory => ({
  id,
  slug,
  title: slug,
  display_order: order,
});
const photo = (id: string, categoryId: string | null): ILookbook => ({
  id,
  title: id,
  category_id: categoryId,
  description: '',
  image_url: `https://example.com/${id}.jpg`,
  tagged_product_ids: [],
  created_at: '2026-11-22T00:00:00.000Z',
});

const categories = [category('fabric', 'rem-vai', 1), category('roller', 'rem-cuon', 2), category('wood', 'rem-go', 3)];
const photos = [
  photo('a', 'fabric'),
  photo('b', 'wood'),
  photo('c', null),
  photo('d', 'fabric'),
  photo('e', 'deleted'),
];
const ids = (slug?: string) => filterLookbooks(photos, categories, slug).lookbooks.map((lookbook) => lookbook.id);

describe('filterLookbooks', () => {
  it('offers only the categories that have photos, in display order', () => {
    const filter = filterLookbooks(photos, categories);

    expect(filter.categories.map((item) => item.slug)).toEqual(['rem-vai', 'rem-go']);
    expect(filter.hasUncategorised).toBe(true);
  });

  it('shows every photo without a slug or with an unknown or empty-category slug', () => {
    expect(ids()).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(ids('nope')).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(ids('rem-cuon')).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('narrows to the selected category', () => {
    expect(ids('rem-vai')).toEqual(['a', 'd']);
    expect(filterLookbooks(photos, categories, 'rem-go').active?.id).toBe('wood');
  });

  it('lists photos with no category or a missing one under "other"', () => {
    const filter = filterLookbooks(photos, categories, UNCATEGORISED_SLUG);

    expect(filter.isUncategorisedActive).toBe(true);
    expect(filter.lookbooks.map((lookbook) => lookbook.id)).toEqual(['c', 'e']);
  });

  it('needs no "other" chip when every photo is categorised, or when none is', () => {
    expect(filterLookbooks([photo('a', 'fabric')], categories).hasUncategorised).toBe(false);

    const none = filterLookbooks([photo('c', null)], categories, UNCATEGORISED_SLUG);

    expect(none.categories).toEqual([]);
    expect(none.hasUncategorised).toBe(false);
    expect(none.lookbooks).toHaveLength(1);
  });

  it('prefers a real category whose slug is the "other" slug', () => {
    const filter = filterLookbooks(
      [photo('a', 'x'), photo('b', null)],
      [category('x', UNCATEGORISED_SLUG, 1)],
      UNCATEGORISED_SLUG
    );

    expect(filter.active?.id).toBe('x');
    expect(filter.lookbooks.map((lookbook) => lookbook.id)).toEqual(['a']);
  });
});
