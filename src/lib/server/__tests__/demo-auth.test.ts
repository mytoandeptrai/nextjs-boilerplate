vi.mock('server-only', () => ({}));

import { DEMO_ACCOUNT } from '@/constants/const';
import { demoLogin } from '../demo-auth';
import { parseTokenPair } from '../backend';

vi.mock('next/headers', () => ({ cookies: vi.fn() }));

describe('demoLogin', () => {
  it('returns a token pair the cookie writer accepts for the demo account', () => {
    expect(parseTokenPair(demoLogin(DEMO_ACCOUNT).data)).not.toBeNull();
  });

  it('rejects any other credentials with a 401', () => {
    expect(() => demoLogin({ email: DEMO_ACCOUNT.email, password: 'nope' })).toThrow();
    try {
      demoLogin({ email: 'x@y.co', password: DEMO_ACCOUNT.password });
    } catch (error) {
      expect(error).toMatchObject({ status: 401 });
    }
  });
});
