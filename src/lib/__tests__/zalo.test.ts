import type { IQuoteLine } from '@/types/catalog';
import { buildZaloOrder, buildZaloUrl, type IZaloLabels, ZALO_URL_MAX_LENGTH } from '../zalo';

const labels: IZaloLabels = {
  heading: 'ĐƠN ĐẶT RÈM',
  code: 'Mã đơn',
  customer: 'Khách',
  address: 'Địa chỉ',
  width: 'Rộng',
  height: 'Cao',
  fullness: 'Độ chun',
  subtotal: 'Thành tiền',
  total: 'TỔNG TẠM TÍNH',
  notes: 'Ghi chú',
  more: (count) => `... và ${count} sản phẩm khác`,
};

const line = (overrides: Partial<IQuoteLine> = {}): IQuoteLine => ({
  product_id: 'p1',
  slug: 'rem-vai-linen',
  title: 'Rèm vải Linen',
  image: null,
  pricing_type: 'linear_meter',
  width_cm: 320,
  height_cm: 260,
  pleat: { id: 'wave', label: 'Ly sóng', multiplier: 1 },
  fullness: 2.3,
  fabric: { id: 'linen', label: 'Linen kem', price_delta: 0 },
  motor: null,
  quantity: 2,
  unit_price: 1_656_000,
  line_total: 3_312_000,
  ...overrides,
});

const order = (lines: IQuoteLine[]) => ({
  orderCode: '#A1B2C3D4',
  customerName: 'Nguyễn An',
  customerPhone: '0912345678',
  customerAddress: 'Đà Nẵng',
  notes: 'Gọi sau 18h',
  lines,
  total: lines.reduce((sum, item) => sum + item.line_total, 0),
});

describe('buildZaloUrl', () => {
  it('uses the zalo.me/{hotline}?text={message} format with digits only', () => {
    expect(buildZaloUrl('0941 275.946', 'Xin chào & cảm ơn')).toBe(
      'https://zalo.me/0941275946?text=Xin%20ch%C3%A0o%20%26%20c%E1%BA%A3m%20%C6%A1n'
    );
    expect(buildZaloUrl('+84 941 275 946')).toBe('https://zalo.me/84941275946');
  });

  it('returns null when the hotline is not set', () => {
    expect(buildZaloUrl('')).toBeNull();
    expect(buildZaloUrl('n/a', 'hi')).toBeNull();
  });
});

describe('buildZaloOrder', () => {
  it('formats the customer, every line and the total', () => {
    const { message, url } = buildZaloOrder('0941275946', order([line()]), labels);

    expect(message).toBe(
      [
        'ĐƠN ĐẶT RÈM',
        'Mã đơn: #A1B2C3D4',
        'Khách: Nguyễn An - 0912345678',
        'Địa chỉ: Đà Nẵng',
        '---',
        '1. Rèm vải Linen x2',
        '   Rộng 320cm x Cao 260cm | Ly sóng | Độ chun 2.3x | Linen kem',
        '   Thành tiền: 3.312.000đ',
        '---',
        'TỔNG TẠM TÍNH: 3.312.000đ',
        'Ghi chú: Gọi sau 18h',
      ].join('\n')
    );
    expect(decodeURIComponent(url?.split('?text=')[1] ?? '')).toBe(message);
  });

  it('leaves out empty optional fields', () => {
    const { message } = buildZaloOrder(
      '0941275946',
      {
        ...order([line({ pleat: null, fullness: null, motor: { id: 'm', label: 'Somfy', price: 1 } })]),
        notes: '',
        customerAddress: '',
      },
      labels
    );

    expect(message).not.toContain('Địa chỉ');
    expect(message).not.toContain('Ghi chú');
    expect(message).toContain('Rộng 320cm x Cao 260cm | Linen kem | Somfy');
  });

  it('collapses trailing lines so the link stays under the length limit, keeping the real total', () => {
    const lines = Array.from({ length: 40 }, (_, index) => line({ title: `Rèm vải cao cấp số ${index + 1}` }));
    const { message, url } = buildZaloOrder('0941275946', order(lines), labels);

    expect(url?.length).toBeLessThanOrEqual(ZALO_URL_MAX_LENGTH);
    expect(message).toMatch(/\.\.\. và \d+ sản phẩm khác/);
    expect(message).toContain('1. Rèm vải cao cấp số 1 x2');
    expect(message).toContain('TỔNG TẠM TÍNH: 132.480.000đ');
  });

  it('still returns the message when there is no hotline', () => {
    const { message, url } = buildZaloOrder('', order([line()]), labels);

    expect(url).toBeNull();
    expect(message).toContain('#A1B2C3D4');
  });
});
