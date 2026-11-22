import { buildRoute, INDEXABLE_ROUTES, isAdminPath, ROUTES, safeAdminNext } from '../routes';

describe('buildRoute', () => {
  it('replaces :param placeholders and encodes values', () => {
    expect(buildRoute(ROUTES.PRODUCT_DETAIL, { slug: 'a b' })).toBe('/products/a%20b');
    expect(buildRoute('/users/:id/posts/:postId', { id: 1, postId: 2 })).toBe('/users/1/posts/2');
  });

  it('returns the route untouched without params', () => {
    expect(buildRoute(ROUTES.LOOKBOOK)).toBe('/lookbook');
  });
});

describe('admin routes', () => {
  it('recognises admin paths without matching look-alikes', () => {
    expect(isAdminPath('/admin')).toBe(true);
    expect(isAdminPath('/admin/quotes')).toBe(true);
    expect(isAdminPath('/administrator')).toBe(false);
    expect(isAdminPath('/products')).toBe(false);
  });

  it('never lists admin pages or the cart in the sitemap', () => {
    expect(INDEXABLE_ROUTES.some(isAdminPath)).toBe(false);
    expect(INDEXABLE_ROUTES).not.toContain(ROUTES.CART);
  });

  it('only accepts admin paths as a post-login destination', () => {
    expect(safeAdminNext('/admin/products')).toBe('/admin/products');
    expect(safeAdminNext(null)).toBe(ROUTES.ADMIN);
    expect(safeAdminNext('/admin/login')).toBe(ROUTES.ADMIN);
    expect(safeAdminNext('https://evil.example')).toBe(ROUTES.ADMIN);
    expect(safeAdminNext('//evil.example/admin')).toBe(ROUTES.ADMIN);
    expect(safeAdminNext('/products')).toBe(ROUTES.ADMIN);
  });
});
