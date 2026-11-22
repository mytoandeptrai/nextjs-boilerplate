import { buildProductsHref, parseProductSort } from '../product-listing';

describe('parseProductSort', () => {
  it.each([
    ['popular', 'popular'],
    ['price-asc', 'price-asc'],
    ['price-desc', 'price-desc'],
    ['newest', 'newest'],
    [undefined, 'newest'],
    ['cheapest', 'newest'],
    [['popular'], 'newest'],
  ])('reads %j as %s', (value, sort) => {
    expect(parseProductSort(value)).toBe(sort);
  });
});

describe('buildProductsHref', () => {
  it('leaves the defaults out of the address', () => {
    expect(buildProductsHref()).toBe('/products');
    expect(buildProductsHref({ sort: 'newest', page: 1 })).toBe('/products');
  });

  it('keeps the category, the order and the page together', () => {
    expect(buildProductsHref({ category: 'rem-vai' })).toBe('/products?category=rem-vai');
    expect(buildProductsHref({ sort: 'price-asc', page: 2 })).toBe('/products?sort=price-asc&page=2');
    expect(buildProductsHref({ category: 'rem-vai', sort: 'popular', page: 3 })).toBe(
      '/products?category=rem-vai&sort=popular&page=3'
    );
  });
});
