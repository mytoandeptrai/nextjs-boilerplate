import {
  articleJsonLd,
  breadcrumbJsonLd,
  buildMetadata,
  getAbsoluteUrl,
  getLanguageAlternates,
  getLocalizedPath,
  getRobots,
  organizationJsonLd,
  productJsonLd,
  toQueryString,
  webSiteJsonLd,
} from '../seo';

vi.mock('@/hooks/use-translations-server', () => ({
  useTranslationsServer: async () => ({
    t: (key: string) => ({ siteName: 'Store', defaultTitle: 'Store | Home' })[key] ?? key,
  }),
}));

describe('seo helpers', () => {
  it('prefixes only non-default locales', () => {
    expect(getLocalizedPath('vi', '/products')).toBe('/products');
    expect(getLocalizedPath('en', '/products')).toBe('/en/products');
    expect(getLocalizedPath('vi')).toBe('/');
    expect(getLocalizedPath('en')).toBe('/en');
  });

  it('builds absolute URLs from the app origin', () => {
    expect(getAbsoluteUrl('en', '/products')).toBe('http://localhost:3000/en/products');
  });

  it('lists every locale plus x-default as hreflang alternates', () => {
    expect(getLanguageAlternates('/products')).toEqual({
      en: 'http://localhost:3000/en/products',
      vi: 'http://localhost:3000/products',
      'x-default': 'http://localhost:3000/products',
    });
  });

  it('never indexes outside production or when asked', () => {
    expect(getRobots()).toMatchObject({ index: false, follow: false });
    expect(getRobots(true)).toMatchObject({ index: false, follow: false });
  });

  it('builds schema.org payloads', () => {
    expect(webSiteJsonLd({ locale: 'en', name: 'Store', description: 'd' })).toMatchObject({
      '@type': 'WebSite',
      url: 'http://localhost:3000/en',
      inLanguage: 'en',
    });
    expect(breadcrumbJsonLd([{ name: 'Home', url: 'http://x' }]).itemListElement[0]).toMatchObject({ position: 1 });
  });

  it('keeps empty parameters out of a query string', () => {
    expect(toQueryString({ category: 'rem-vai', page: 2 })).toBe('?category=rem-vai&page=2');
    expect(toQueryString({ category: undefined, page: undefined })).toBe('');
    expect(toQueryString()).toBe('');
  });

  it('puts the category and the page in the canonical URL and in every hreflang alternate', async () => {
    const metadata = await buildMetadata({ locale: 'en', path: '/products', query: { category: 'rem-vai', page: 2 } });

    expect(metadata.alternates).toEqual({
      canonical: 'http://localhost:3000/en/products?category=rem-vai&page=2',
      languages: {
        vi: 'http://localhost:3000/products?category=rem-vai&page=2',
        en: 'http://localhost:3000/en/products?category=rem-vai&page=2',
        'x-default': 'http://localhost:3000/products?category=rem-vai&page=2',
      },
    });
  });

  it('shares the page image when there is one and the site image otherwise', async () => {
    const withImage = await buildMetadata({
      locale: 'vi',
      title: 'Linen',
      image: { url: 'https://cdn/x.jpg', alt: 'Linen' },
    });
    const without = await buildMetadata({ locale: 'vi', title: 'Linen' });

    expect(withImage.openGraph?.images).toEqual([{ url: 'https://cdn/x.jpg', alt: 'Linen' }]);
    expect(withImage.twitter?.images).toEqual(['https://cdn/x.jpg']);
    expect(without.openGraph?.images).toEqual([expect.objectContaining({ url: '/opengraph-image' })]);
    expect(withImage.openGraph).toMatchObject({ title: 'Linen | Store', type: 'website' });
  });

  it('marks a guide as an article with its publication date', async () => {
    const metadata = await buildMetadata({ locale: 'vi', title: 'Guide', article: { publishedTime: '2026-01-03' } });

    expect(metadata.openGraph).toMatchObject({ type: 'article', publishedTime: '2026-01-03' });
  });

  it('describes the shop with its phone only when there is one', () => {
    expect(organizationJsonLd({ description: 'd', telephone: '0941275946' })).toMatchObject({
      '@type': 'HomeGoodsStore',
      '@id': 'http://localhost:3000/#organization',
      logo: 'http://localhost:3000/android-chrome-512x512.png',
      telephone: '0941275946',
      contactPoint: { telephone: '0941275946' },
    });
    expect(organizationJsonLd({ description: 'd' })).not.toHaveProperty('telephone');
  });

  it('prices a product per unit of measure, sold by the shop', () => {
    const product = productJsonLd({
      url: 'http://localhost:3000/products/linen',
      name: 'Linen',
      description: '',
      images: [],
      price: 450_000,
      unitCode: 'MTR',
    });

    expect(product.offers).toMatchObject({
      price: 450_000,
      priceCurrency: 'VND',
      priceSpecification: { unitCode: 'MTR', price: 450_000 },
      seller: { '@id': 'http://localhost:3000/#organization' },
    });
    expect(product.image).toBeUndefined();
    expect(product.description).toBeUndefined();
  });

  it('describes a guide as an article published by the shop', () => {
    expect(
      articleJsonLd({
        url: 'http://x/blog/a',
        locale: 'vi',
        headline: 'A',
        description: 'd',
        datePublished: '2026-01-03',
      })
    ).toMatchObject({ '@type': 'Article', headline: 'A', datePublished: '2026-01-03', inLanguage: 'vi' });
  });
});
