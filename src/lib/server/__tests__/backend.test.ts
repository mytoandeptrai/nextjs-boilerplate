vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ cookies: vi.fn() }));

import { parseTokenPair } from '../backend';

describe('parseTokenPair', () => {
  const tokens = { accessToken: 'AT', refreshToken: 'RT' };

  it('reads a plain response', () => {
    expect(parseTokenPair(tokens)).toEqual(tokens);
  });

  it('reads a response wrapped in a data envelope', () => {
    expect(parseTokenPair({ data: tokens })).toEqual(tokens);
  });

  it('returns null instead of letting empty cookies through', () => {
    expect(parseTokenPair({ accessToken: 'AT' })).toBeNull();
    expect(parseTokenPair({ data: { accessToken: '', refreshToken: 'RT' } })).toBeNull();
    expect(parseTokenPair({ access_token: 'AT', refresh_token: 'RT' })).toBeNull();
    expect(parseTokenPair(null)).toBeNull();
    expect(parseTokenPair('<html>')).toBeNull();
  });
});
