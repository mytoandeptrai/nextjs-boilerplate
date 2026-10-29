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
    expect(getLocalizedPath('en', '/login')).toBe('/login');
    expect(getLocalizedPath('vi', '/login')).toBe('/vi/login');
    expect(getLocalizedPath('en')).toBe('/');
    expect(getLocalizedPath('vi')).toBe('/vi');
  });

  it('builds absolute URLs from the app origin', () => {
    expect(getAbsoluteUrl('vi', '/login')).toBe('http://localhost:3000/vi/login');
  });

  it('lists every locale plus x-default as hreflang alternates', () => {
    expect(getLanguageAlternates('/login')).toEqual({
      en: 'http://localhost:3000/login',
      vi: 'http://localhost:3000/vi/login',
      'x-default': 'http://localhost:3000/login',
    });
  });

  it('never indexes outside production or when asked', () => {
    expect(getRobots()).toMatchObject({ index: false, follow: false });
    expect(getRobots(true)).toMatchObject({ index: false, follow: false });
  });

  it('builds schema.org payloads', () => {
    expect(webSiteJsonLd({ locale: 'vi', name: 'Jacob', description: 'd' })).toMatchObject({
      '@type': 'WebSite',
      url: 'http://localhost:3000/vi',
      inLanguage: 'vi',
    });
    expect(breadcrumbJsonLd([{ name: 'Home', url: 'http://x' }]).itemListElement[0]).toMatchObject({ position: 1 });
  });
});
