import { buildRoute, PUBLIC_ROUTES, ROUTES } from '../routes';

describe('buildRoute', () => {
  it('replaces :param placeholders and encodes values', () => {
    expect(buildRoute('/item1/:id', { id: 'a b' })).toBe('/item1/a%20b');
    expect(buildRoute('/users/:id/posts/:postId', { id: 1, postId: 2 })).toBe('/users/1/posts/2');
  });

  it('returns the route untouched without params', () => {
    expect(buildRoute(ROUTES.ITEM1)).toBe('/item1');
  });

  it('keeps the login page public', () => {
    expect(PUBLIC_ROUTES).toContain(ROUTES.LOGIN);
  });
});
