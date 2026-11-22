import { isRateLimited, isSameOrigin } from '../rate-limit';
import { sniffImageType } from '../storage';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: vi.fn() }));

const bytes = (...values: number[]) => new Uint8Array([...values, ...new Array(16).fill(0)]);
const ascii = (text: string) => [...text].map((char) => char.charCodeAt(0));

describe('sniffImageType', () => {
  it('recognises the allowed formats from their first bytes', () => {
    expect(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toEqual({ mime: 'image/jpeg', ext: 'jpg' });
    expect(sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47))).toEqual({ mime: 'image/png', ext: 'png' });
    expect(sniffImageType(bytes(...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WEBP')))).toEqual({
      mime: 'image/webp',
      ext: 'webp',
    });
    expect(sniffImageType(bytes(0, 0, 0, 0x20, ...ascii('ftypavif')))).toEqual({ mime: 'image/avif', ext: 'avif' });
  });

  it('rejects everything else, whatever the file is called', () => {
    expect(sniffImageType(new Uint8Array(ascii('<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>')))).toBeNull();
    expect(sniffImageType(new Uint8Array(ascii('<!doctype html><html></html>')))).toBeNull();
    expect(sniffImageType(new Uint8Array([0xff, 0xd8]))).toBeNull();
  });
});

describe('isRateLimited', () => {
  it('allows `limit` hits per window and frees up afterwards', () => {
    const key = `test:${Math.random()}`;

    expect(isRateLimited(key, 2, 1000, 0)).toBe(false);
    expect(isRateLimited(key, 2, 1000, 100)).toBe(false);
    expect(isRateLimited(key, 2, 1000, 200)).toBe(true);
    expect(isRateLimited(key, 2, 1000, 1101)).toBe(false);
  });
});

describe('isSameOrigin', () => {
  const request = (headers: Record<string, string>) => new Request('http://localhost:3000/api/quotes', { headers });

  it('accepts this app and requests without an Origin header', () => {
    expect(isSameOrigin(request({}), 'http://localhost:3000')).toBe(true);
    expect(isSameOrigin(request({ origin: 'http://localhost:3000' }), 'http://localhost:3000')).toBe(true);
    expect(
      isSameOrigin(request({ origin: 'https://shop.example', host: 'shop.example' }), 'http://localhost:3000')
    ).toBe(true);
  });

  it('rejects other sites', () => {
    expect(
      isSameOrigin(request({ origin: 'https://evil.example', host: 'localhost:3000' }), 'http://localhost:3000')
    ).toBe(false);
    expect(isSameOrigin(request({ origin: 'null', host: 'localhost:3000' }), 'http://localhost:3000')).toBe(false);
  });
});
