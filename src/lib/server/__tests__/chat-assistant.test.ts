import type { IProduct } from '@/types/catalog';
import { answerChat, buildSystemPrompt, estimatePrice, linkBarePaths, resetChatContextCache } from '../chat-assistant';

const generateContent = vi.fn();

vi.mock('server-only', () => ({}));
vi.mock('../gemini', async () => ({
  ...(await vi.importActual<typeof import('../gemini')>('../gemini')),
  generateContent: (...args: unknown[]) => generateContent(...args),
}));
vi.mock('@/constants/env.server', () => ({ serverEnv: { GEMINI_API_KEY: 'test-key', GEMINI_MODEL: 'test-model' } }));

const linen: IProduct = {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Rèm vải Linen',
  slug: 'rem-vai-linen',
  category_id: 'cat-1',
  description: 'Vải linen tự nhiên.',
  base_price: 580_000,
  sale_price: null,
  pricing_type: 'linear_meter',
  pleat_options: [
    { id: 'wave', label: 'Định hình sóng', multiplier: 1 },
    { id: 'pinch', label: 'Ly chụp', multiplier: 1.1 },
  ],
  fabric_options: [{ id: 'ivory', label: 'Trắng ngà', price_delta: 0 }],
  motor_options: [{ id: 'rail', label: 'Động cơ ray', price: 3_200_000 }],
  images: [],
  is_active: true,
  created_at: '2026-11-22T00:00:00Z',
};
const wood: IProduct = {
  ...linen,
  id: '22222222-2222-4222-8222-222222222222',
  title: 'Rèm gỗ',
  slug: 'rem-go',
  base_price: 850_000,
  sale_price: 750_000,
  pricing_type: 'square_meter',
  pleat_options: [],
  fabric_options: [],
  motor_options: [],
};
const context = {
  categories: [{ id: 'cat-1', slug: 'rem-vai', title: 'Rèm vải', display_order: 1 }],
  products: [linen, wood],
  posts: [
    {
      id: 'p1',
      title: 'Cách đo rèm',
      slug: 'cach-do-rem',
      content_markdown: 'Đo chiều rộng cửa.',
      thumbnail_url: null,
      published_at: '2026-11-01',
    },
  ],
  zaloHotline: '0941275946',
};

vi.mock('@/api/catalog/requests', () => ({
  getCategories: async () => context.categories,
  getProducts: async () => context.products,
  getPosts: async () => context.posts,
  getZaloHotline: async () => context.zaloHotline,
}));

beforeEach(() => {
  generateContent.mockReset();
  resetChatContextCache();
});

describe('buildSystemPrompt', () => {
  const prompt = buildSystemPrompt(context, 'vi');

  it('lists each product with its page, options and the price the customer pays', () => {
    expect(prompt).toContain('- page: /products/rem-vai-linen');
    expect(prompt).toContain('580,000 VND per metre of width');
    expect(prompt).toContain('Ly chụp [id pinch, x1.1]');
    expect(prompt).toContain('750,000 VND per m2 (on sale, -12%, was 850,000 VND)');
  });

  it('includes the guides, the categories and the hotline', () => {
    expect(prompt).toContain('- page: /blog/cach-do-rem');
    expect(prompt).toContain('/products?category=rem-vai');
    expect(prompt).toContain('0941275946');
  });
});

describe('estimatePrice', () => {
  it('prices with the configurator formula and the given options', () => {
    // 3.2 m * 580,000 * 1.1 + 3,200,000
    expect(
      estimatePrice(context.products, {
        product_slug: 'rem-vai-linen',
        width_cm: 320,
        pleat_id: 'pinch',
        motor_id: 'rail',
        quantity: 2,
      })
    ).toMatchObject({ unit_price: 5_242_000, quantity: 2, total: 10_484_000, pleat: 'Ly chụp', motor: 'Động cơ ray' });
  });

  it('defaults to the first options, no motor and one piece', () => {
    // 3.2 m * 580,000
    expect(estimatePrice(context.products, { product_slug: 'rem-vai-linen', width_cm: 320 })).toMatchObject({
      unit_price: 1_856_000,
      total: 1_856_000,
      pleat: 'Định hình sóng',
      motor: 'none (manual)',
    });
  });

  it('uses the sale price and reports the price before the discount', () => {
    // 2 m * 1.5 m * 750,000, against * 850,000
    expect(estimatePrice(context.products, { product_slug: 'rem-go', width_cm: 200, height_cm: 150 })).toMatchObject({
      unit_price: 2_250_000,
      unit_price_before_discount: 2_550_000,
    });
  });

  it.each([
    [{ product_slug: 'sofa', width_cm: 200 }, 'Unknown product_slug'],
    [{ product_slug: 'rem-go', width_cm: 5 }, 'Invalid width: it must be between 30 and 1200'],
    [{ product_slug: 'rem-go' }, 'Invalid width'],
    [undefined, 'Unknown product_slug'],
  ])('answers an error the model can act on for %j', (args, message) => {
    expect(String(estimatePrice(context.products, args).error)).toContain(message);
  });
});

describe('linkBarePaths', () => {
  it('turns a bracketed site path into a link and leaves real links alone', () => {
    expect(linkBarePaths('Xem ([/products/rem-go]) nhé')).toBe('Xem ([/products/rem-go](/products/rem-go)) nhé');
    expect(linkBarePaths('[Rèm gỗ](/products/rem-go) [1]')).toBe('[Rèm gỗ](/products/rem-go) [1]');
  });
});

describe('answerChat', () => {
  const messages = [{ role: 'user' as const, content: 'Rèm linen rộng 3m2 giá bao nhiêu?' }];

  it('returns the model text', async () => {
    generateContent.mockResolvedValue({ role: 'model', parts: [{ text: ' Chào bạn ' }] });

    expect(await answerChat(messages, 'vi')).toBe('Chào bạn');
    expect(generateContent.mock.calls[0][0].contents).toEqual([
      { role: 'user', parts: [{ text: messages[0].content }] },
    ]);
  });

  it('runs the price tool and sends its result back with the untouched model turn', async () => {
    const call = {
      functionCall: { name: 'estimate_price', id: 'call-1', args: { product_slug: 'rem-vai-linen', width_cm: 320 } },
      thoughtSignature: 'sig',
    };

    generateContent
      .mockResolvedValueOnce({ role: 'model', parts: [call] })
      .mockResolvedValueOnce({ role: 'model', parts: [{ text: 'Giá tạm tính 1.856.000đ' }] });

    expect(await answerChat(messages, 'vi')).toBe('Giá tạm tính 1.856.000đ');

    const { contents } = generateContent.mock.calls[1][0];

    expect(contents[1]).toEqual({ role: 'model', parts: [call] });
    expect(contents[2].parts[0].functionResponse).toMatchObject({
      name: 'estimate_price',
      id: 'call-1',
      response: { unit_price: 1_856_000 },
    });
  });

  it('gives up instead of looping when the model keeps calling tools', async () => {
    generateContent.mockResolvedValue({
      role: 'model',
      parts: [{ functionCall: { name: 'estimate_price', args: {} } }],
    });

    await expect(answerChat(messages, 'vi')).rejects.toMatchObject({ reason: 'failed' });
    expect(generateContent).toHaveBeenCalledTimes(3);
  });
});
