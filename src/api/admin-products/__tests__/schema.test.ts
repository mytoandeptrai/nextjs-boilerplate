import { productSchema } from '../schema';

const product = {
  title: 'Rèm vải Linen',
  slug: 'rem-vai-linen',
  category_id: null,
  description: '',
  base_price: '450000',
  pricing_type: 'linear_meter',
  pleat_options: [],
  fabric_options: [],
  motor_options: [],
  images: [],
  is_active: true,
};

describe('productSchema sale_price', () => {
  it.each([
    ['', null],
    [undefined, null],
    [null, null],
    ['360000', 360_000],
    [0, 0],
  ])('reads %j as %j', (sale_price, expected) => {
    expect(productSchema.parse({ ...product, sale_price }).sale_price).toBe(expected);
  });

  it.each(['450000', '500000', '-1', 'abc'])('rejects %j: not a price below the base price', (sale_price) => {
    const result = productSchema.safeParse({ ...product, sale_price });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['sale_price']);
  });
});
