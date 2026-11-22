import sitemap from '../sitemap';

vi.mock('@/api/catalog/requests', () => ({
  getCategories: async () => [
    { id: 'cat-1', slug: 'rem-vai', title: 'Rèm vải' },
    { id: 'cat-2', slug: 'rem-cuon', title: 'Rèm cuốn' },
  ],
  getProducts: async () => [
    {
      slug: 'rem-vai-linen',
      category_id: 'cat-1',
      images: ['https://cdn.example/linen.jpg'],
      created_at: '2026-01-02T00:00:00Z',
    },
  ],
  getPosts: async () => [{ slug: 'cach-do-rem', thumbnail_url: null, published_at: '2026-01-03T00:00:00Z' }],
}));

describe('sitemap', () => {
  it('lists storefront routes, products and guides once per locale, with hreflang alternates', async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        'http://localhost:3000/',
        'http://localhost:3000/en',
        'http://localhost:3000/products',
        'http://localhost:3000/en/lookbook',
        'http://localhost:3000/products/rem-vai-linen',
        'http://localhost:3000/en/blog/cach-do-rem',
      ])
    );
    expect(entries[0].alternates?.languages).toMatchObject({ en: 'http://localhost:3000/en' });
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('lists a catalogue page for each category that has products, and not for an empty one', async () => {
    const entries = await sitemap();
    const category = entries.find((entry) => entry.url === 'http://localhost:3000/products?category=rem-vai');

    expect(category?.alternates?.languages).toMatchObject({
      en: 'http://localhost:3000/en/products?category=rem-vai',
    });
    expect(entries.some((entry) => entry.url.includes('rem-cuon'))).toBe(false);
  });

  it('carries the product photos and the dates from the database', async () => {
    const entries = await sitemap();
    const product = entries.find((entry) => entry.url === 'http://localhost:3000/products/rem-vai-linen');

    expect(product?.images).toEqual(['https://cdn.example/linen.jpg']);
    expect(product?.lastModified).toEqual(new Date('2026-01-02T00:00:00Z'));
  });

  it('never exposes the admin portal or the cart', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls.some((url) => url.includes('/admin') || url.includes('/cart'))).toBe(false);
  });
});
