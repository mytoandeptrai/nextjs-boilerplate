import { digitsOnly, formatVnd, normalizePhone, slugify, toOrderCode, VN_PHONE_REGEX } from '../format';
import { getExcerpt } from '../markdown';

describe('format helpers', () => {
  it('formats VND with dot separators', () => {
    expect(formatVnd(11_888_000)).toBe('11.888.000đ');
    expect(formatVnd(0)).toBe('0đ');
  });

  it('slugifies Vietnamese titles', () => {
    expect(slugify('Rèm vải Linen Đà Nẵng  (2 lớp)')).toBe('rem-vai-linen-da-nang-2-lop');
    expect(slugify('  --Đo cửa?--  ')).toBe('do-cua');
  });

  it('derives a short order code from the quote id', () => {
    expect(toOrderCode('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d')).toBe('#A1B2C3D4');
  });

  it('validates Vietnamese mobile numbers after normalising separators', () => {
    expect(VN_PHONE_REGEX.test(normalizePhone('0941 275 946'))).toBe(true);
    expect(VN_PHONE_REGEX.test(normalizePhone('+84 941.275.946'))).toBe(true);
    expect(VN_PHONE_REGEX.test('12345')).toBe(false);
    expect(VN_PHONE_REGEX.test('0241275946')).toBe(false);
    expect(digitsOnly('+84 (941) 275-946')).toBe('84941275946');
  });
});

describe('getExcerpt', () => {
  it('returns the first paragraph as plain text', () => {
    const markdown =
      '## Chuẩn bị\n\n![ảnh](https://x/y.jpg)\n\nBạn cần **thước dây** và [giấy bút](https://x).\n\n- một\n- hai';

    expect(getExcerpt(markdown)).toBe('Bạn cần thước dây và giấy bút.');
  });

  it('truncates long text with an ellipsis', () => {
    const excerpt = getExcerpt('a'.repeat(300), 50);

    expect(excerpt).toHaveLength(50);
    expect(excerpt.endsWith('…')).toBe(true);
  });

  it('handles empty content', () => {
    expect(getExcerpt('')).toBe('');
  });
});
