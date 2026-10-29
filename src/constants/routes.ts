export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ITEM1: '/item1',
  REACT_19: '/react-19',
} as const;

/** Routes that stay reachable without a session. */
export const PUBLIC_ROUTES: string[] = [ROUTES.LOGIN];

/** Routes listed in `sitemap.xml`. */
/** The CMS pages sit behind the session guard, so only the login page is public and indexable. */
export const INDEXABLE_ROUTES: string[] = [ROUTES.LOGIN];

/**
 * Replace `:param` placeholders of a route.
 * @example buildRoute('/users/:id', { id: 1 }) // '/users/1'
 */
export const buildRoute = (route: string, params: Record<string, string | number> = {}): string =>
  Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(String(value))),
    route
  );
