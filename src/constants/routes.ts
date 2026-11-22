export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:slug',
  LOOKBOOK: '/lookbook',
  BLOG: '/blog',
  BLOG_POST: '/blog/:slug',
  CART: '/cart',
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_QUOTES: '/admin/quotes',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_NEW: '/admin/products/new',
  ADMIN_PRODUCT_EDIT: '/admin/products/:id',
  ADMIN_LOOKBOOKS: '/admin/lookbooks',
  ADMIN_POSTS: '/admin/posts',
  ADMIN_POST_NEW: '/admin/posts/new',
  ADMIN_POST_EDIT: '/admin/posts/:id',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

/** Everything under this prefix needs an admin session, except the login page. */
export const ADMIN_PREFIX = ROUTES.ADMIN;

/** Static routes listed in `sitemap.xml`. Product and guide pages are added from the database. */
export const INDEXABLE_ROUTES: string[] = [ROUTES.HOME, ROUTES.PRODUCTS, ROUTES.LOOKBOOK, ROUTES.BLOG];

export const isAdminPath = (path: string): boolean => path === ADMIN_PREFIX || path.startsWith(`${ADMIN_PREFIX}/`);

/** Only same-app admin paths are accepted as a post-login destination (no open redirect). */
/** Query flag on the admin login URL: the session cookie was rejected by Supabase, show the form anyway. */
export const ADMIN_REAUTH_PARAM = 'reauth';

export const safeAdminNext = (next: string | null | undefined): string =>
  next && isAdminPath(next) && next !== ROUTES.ADMIN_LOGIN && !next.startsWith('//') ? next : ROUTES.ADMIN;

/**
 * Replace `:param` placeholders of a route.
 * @example buildRoute('/users/:id', { id: 1 }) // '/users/1'
 */
export const buildRoute = (route: string, params: Record<string, string | number> = {}): string =>
  Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(String(value))),
    route
  );
