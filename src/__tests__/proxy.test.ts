import { NextRequest } from 'next/server';

import proxy, { isTokenExpired } from '../proxy';

const jwt = (exp: number) => `header.${btoa(JSON.stringify({ exp }))}.signature`;
const nowSeconds = () => Math.floor(Date.now() / 1000);
const VALID = jwt(nowSeconds() + 3600);
const EXPIRED = jwt(nowSeconds() - 10);

const call = (path: string, cookie?: string) =>
  proxy(new NextRequest(`http://localhost:3000${path}`, cookie ? { headers: { cookie } } : undefined));

const location = async (path: string, cookie?: string) => (await call(path, cookie)).headers.get('location');

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('isTokenExpired', () => {
  it('reads the expiry without trusting the token', () => {
    expect(isTokenExpired(VALID)).toBe(false);
    expect(isTokenExpired(EXPIRED)).toBe(true);
    // Renewed one minute early.
    expect(isTokenExpired(jwt(nowSeconds() + 30))).toBe(true);
  });

  it('treats a missing or malformed token as expired', () => {
    expect(isTokenExpired(undefined)).toBe(true);
    expect(isTokenExpired('not-a-jwt')).toBe(true);
  });
});

describe('proxy', () => {
  it('leaves the storefront public', async () => {
    expect(await location('/')).toBeNull();
    expect(await location('/products/rem-vai')).toBeNull();
    expect(await location('/en/lookbook')).toBeNull();
    expect(await location('/cart')).toBeNull();
  });

  it('sends anonymous visitors of the admin portal to the login page, keeping locale and destination', async () => {
    expect(await location('/admin')).toBe('http://localhost:3000/admin/login?next=%2Fadmin');
    expect(await location('/en/admin/products')).toBe('http://localhost:3000/en/admin/login?next=%2Fadmin%2Fproducts');
  });

  it('lets anonymous visitors reach the admin login page', async () => {
    expect(await location('/admin/login')).toBeNull();
  });

  it('lets a visitor with an unexpired session through and marks the portal noindex', async () => {
    const response = await call('/admin/quotes', `accessToken=${VALID}`);

    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });

  it('keeps signed-in admins away from the login page and only follows admin destinations', async () => {
    expect(await location('/admin/login', `accessToken=${VALID}`)).toBe('http://localhost:3000/admin');
    expect(await location('/admin/login?next=/admin/posts', `accessToken=${VALID}`)).toBe(
      'http://localhost:3000/admin/posts'
    );
    expect(await location('/admin/login?next=https://evil.example', `accessToken=${VALID}`)).toBe(
      'http://localhost:3000/admin'
    );
  });

  it('rejects an expired session that cannot be renewed and clears its cookies', async () => {
    const response = await call('/admin', `accessToken=${EXPIRED}`);

    expect(response.headers.get('location')).toBe('http://localhost:3000/admin/login?next=%2Fadmin');
    expect(response.headers.get('set-cookie')).toContain('accessToken=;');
  });

  it('renews an expired access token with the refresh token before rendering', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'publishable');
    const fetchMock = vi.fn(async () => Response.json({ access_token: VALID, refresh_token: 'next-refresh' }));

    vi.stubGlobal('fetch', fetchMock);

    const response = await call('/admin/quotes', `accessToken=${EXPIRED}; refreshToken=old-refresh`);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://project.supabase.co/auth/v1/token?grant_type=refresh_token',
      expect.objectContaining({ body: JSON.stringify({ refresh_token: 'old-refresh' }) })
    );
    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('set-cookie')).toContain(`accessToken=${VALID}`);
    expect(response.headers.get('set-cookie')).toContain('refreshToken=next-refresh');
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
  });
});
