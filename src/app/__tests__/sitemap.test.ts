import sitemap from '../sitemap';

vi.mock('@/api/catalog/requests', () => ({
  getProducts: async () => [{ slug: 'rem-vai-linen', created_at: '2026-01-02T00:00:00Z' }],
  getPosts: async () => [{ slug: 'cach-do-rem', published_at: '2026-01-03T00:00:00Z' }],
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
  });

  it('never exposes the admin portal or the cart', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls.some((url) => url.includes('/admin') || url.includes('/cart'))).toBe(false);
  });
});
