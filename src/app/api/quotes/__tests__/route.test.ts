import type { IProduct } from '@/types/catalog';
import { POST } from '../route';

const insert = vi.fn();
const sendQuoteAlert = vi.fn();
const getProductsByIds = vi.fn();

vi.mock('server-only', () => ({}));
vi.mock('@/api/catalog/requests', () => ({ getProductsByIds: (ids: string[]) => getProductsByIds(ids) }));
vi.mock('@/lib/supabase/client', () => ({ getSupabaseClient: () => ({ from: () => ({ insert }) }) }));
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { value: 'owner@example.com' } }) }) }),
    }),
  }),
}));
vi.mock('@/lib/server/email', () => ({ sendQuoteAlert: (...args: unknown[]) => sendQuoteAlert(...args) }));

const PRODUCT_ID = '11111111-1111-4111-8111-111111111111';
const QUOTE_ID = '22222222-2222-4222-8222-222222222222';

const product: IProduct = {
  id: PRODUCT_ID,
  title: 'Rèm vải Linen',
  slug: 'rem-vai-linen',
  category_id: null,
  description: '',
  base_price: 450_000,
  pricing_type: 'linear_meter',
  pleat_options: [{ id: 'triple', label: 'Ly ba', multiplier: 1.2 }],
  fabric_options: [],
  motor_options: [{ id: 'somfy', label: 'Somfy', price: 4_500_000 }],
  images: ['https://cdn.example/a.jpg'],
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
};

const body = (overrides: Record<string, unknown> = {}) => ({
  id: QUOTE_ID,
  channel: 'email',
  customerName: ' Nguyễn An ',
  customerPhone: '0941 275 946',
  customerAddress: 'Đà Nẵng',
  notes: '',
  items: [
    {
      productId: PRODUCT_ID,
      widthCm: 320,
      heightCm: 260,
      pleatId: 'triple',
      fullness: 2.3,
      fabricId: null,
      motorId: 'somfy',
      quantity: 2,
    },
  ],
  ...overrides,
});

let ip = 0;
const post = (payload: unknown, headers: Record<string, string> = {}) =>
  POST(
    new Request('http://localhost:3000/api/quotes', {
      method: 'POST',
      // A fresh address per request keeps the rate limiter out of the way.
      headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.0.0.${++ip}`, ...headers },
      body: JSON.stringify(payload),
    })
  );

beforeEach(() => {
  insert.mockReset().mockResolvedValue({ error: null });
  sendQuoteAlert.mockReset().mockResolvedValue(true);
  getProductsByIds.mockReset().mockResolvedValue([product]);
});

describe('POST /api/quotes', () => {
  it('recomputes every price from the database and ignores client-sent totals', async () => {
    const response = await post(
      body({ total_estimate: 1, totalEstimate: 1, items: [{ ...body().items[0], unitPrice: 1, line_total: 1 }] })
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: QUOTE_ID, totalEstimate: 12_974_000, emailSent: true });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: QUOTE_ID,
        status: 'new',
        channel: 'email',
        customer_name: 'Nguyễn An',
        customer_phone: '0941275946',
        total_estimate: 12_974_000,
        cart_items: [
          expect.objectContaining({
            title: 'Rèm vải Linen',
            unit_price: 6_487_000,
            line_total: 12_974_000,
            quantity: 2,
          }),
        ],
      })
    );
  });

  it('emails the configured address for survey requests only', async () => {
    await post(body());
    expect(sendQuoteAlert).toHaveBeenCalledWith('owner@example.com', expect.objectContaining({ id: QUOTE_ID }));

    sendQuoteAlert.mockClear();

    const response = await post(body({ channel: 'zalo' }));

    expect(sendQuoteAlert).not.toHaveBeenCalled();
    expect((await response.json()).emailSent).toBe(false);
  });

  it('keeps the lead when the email alert fails', async () => {
    sendQuoteAlert.mockResolvedValue(false);

    const response = await post(body());

    expect(response.status).toBe(201);
    expect((await response.json()).emailSent).toBe(false);
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('answers 409 with the ids of products that are gone', async () => {
    getProductsByIds.mockResolvedValue([]);

    const response = await post(body());

    expect(response.status).toBe(409);
    expect((await response.json()).unavailableProductIds).toEqual([PRODUCT_ID]);
    expect(insert).not.toHaveBeenCalled();
  });

  it('rejects invalid input before touching the database', async () => {
    for (const invalid of [
      body({ customerPhone: '123' }),
      body({ customerName: '   ' }),
      body({ items: [] }),
      body({ items: [{ ...body().items[0], widthCm: 5 }] }),
      body({ items: [{ ...body().items[0], quantity: 500 }] }),
      body({ channel: 'sms' }),
      'not json',
    ]) {
      expect((await post(invalid)).status).toBe(400);
    }

    expect(insert).not.toHaveBeenCalled();
  });

  it('treats a repeated id as a retry: success, no second lead, no second email', async () => {
    insert.mockResolvedValue({ error: { code: '23505', message: 'duplicate key' } });

    const response = await post(body());

    expect(response.status).toBe(200);
    expect(sendQuoteAlert).not.toHaveBeenCalled();
  });

  it('answers 500 when the lead cannot be stored', async () => {
    insert.mockResolvedValue({ error: { code: '08006', message: 'connection failure' } });

    expect((await post(body())).status).toBe(500);
    expect(sendQuoteAlert).not.toHaveBeenCalled();
  });

  it('silently drops honeypot submissions', async () => {
    const response = await post(body({ website: 'https://spam.example' }));

    expect(response.status).toBe(201);
    expect(insert).not.toHaveBeenCalled();
    expect(sendQuoteAlert).not.toHaveBeenCalled();
  });

  it('rejects cross-origin posts', async () => {
    const response = await post(body(), { origin: 'https://evil.example', host: 'localhost:3000' });

    expect(response.status).toBe(403);
    expect(insert).not.toHaveBeenCalled();
  });

  it('rate limits repeated submissions from one address', async () => {
    const statuses: number[] = [];

    for (let attempt = 0; attempt < 6; attempt += 1) {
      statuses.push((await post(body(), { 'x-forwarded-for': '203.0.113.9' })).status);
    }

    expect(statuses).toEqual([201, 201, 201, 201, 201, 429]);
  });
});
