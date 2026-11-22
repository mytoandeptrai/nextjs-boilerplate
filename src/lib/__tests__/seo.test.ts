import {
  breadcrumbJsonLd,
  getAbsoluteUrl,
  getLanguageAlternates,
  getLocalizedPath,
  getRobots,
  webSiteJsonLd,
} from '../seo';

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
});
