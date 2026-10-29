import sitemap from '../sitemap';

describe('sitemap', () => {
  it('lists only public routes, once per locale, with hreflang alternates', () => {
    const entries = sitemap();

    expect(entries.map((entry) => entry.url)).toEqual([
      'http://localhost:3000/login',
      'http://localhost:3000/vi/login',
    ]);
    expect(entries[0].alternates?.languages).toMatchObject({ vi: 'http://localhost:3000/vi/login' });
  });
});
