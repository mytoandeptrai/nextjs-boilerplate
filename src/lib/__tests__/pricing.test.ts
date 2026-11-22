import type { IConfiguration, IProduct } from '@/types/catalog';
import { calculatePrice, getDiscountPercent, getEffectivePrice, getSalePrice, roundToThousand } from '../pricing';

type Priced = Pick<
  IProduct,
  'base_price' | 'sale_price' | 'pricing_type' | 'pleat_options' | 'fabric_options' | 'motor_options'
>;

const curtain: Priced = {
  base_price: 450_000,
  sale_price: null,
  pricing_type: 'linear_meter',
  pleat_options: [
    { id: 'wave', label: 'Wave', multiplier: 1 },
    { id: 'triple', label: 'Triple pleat', multiplier: 1.2 },
  ],
  fabric_options: [
    { id: 'linen', label: 'Linen', price_delta: 0 },
    { id: 'velvet', label: 'Velvet', price_delta: 120_000 },
  ],
  motor_options: [{ id: 'somfy', label: 'Somfy', price: 4_500_000 }],
};

const blind: Priced = { ...curtain, base_price: 380_000, pricing_type: 'square_meter', pleat_options: [] };

const config = (overrides: Partial<IConfiguration> = {}): IConfiguration => ({
  widthCm: 320,
  heightCm: 260,
  pleatId: 'wave',
  fullness: 2,
  fabricId: 'linen',
  motorId: null,
  quantity: 1,
  ...overrides,
});

const priceOf = (product: Priced, overrides?: Partial<IConfiguration>) => {
  const result = calculatePrice(product, config(overrides));

  if (!result.ok) throw new Error(`unexpected error: ${result.error}`);

  return result;
};

describe('roundToThousand', () => {
  it('rounds half up to the nearest 1,000 VND', () => {
    expect(roundToThousand(1_440_499)).toBe(1_440_000);
    expect(roundToThousand(1_440_500)).toBe(1_441_000);
  });
});

describe('calculatePrice: linear meter', () => {
  it('is width x price per meter at the base fullness, ignoring the height', () => {
    expect(priceOf(curtain).unitPrice).toBe(1_440_000); // 3.2 m x 450,000
    expect(priceOf(curtain, { heightCm: 500 }).unitPrice).toBe(1_440_000);
  });

  it('applies the pleat multiplier and the 2.3x fullness (x1.15)', () => {
    expect(priceOf(curtain, { pleatId: 'triple' }).unitPrice).toBe(1_728_000); // x1.2
    expect(priceOf(curtain, { fullness: 2.3 }).unitPrice).toBe(1_656_000); // x1.15
    expect(priceOf(curtain, { pleatId: 'triple', fullness: 2.3 }).multiplier).toBeCloseTo(1.38);
  });

  it('adds the fabric surcharge per meter and the motor once per piece', () => {
    expect(priceOf(curtain, { fabricId: 'velvet' }).unitPrice).toBe(1_824_000); // 3.2 x 570,000
    expect(priceOf(curtain, { motorId: 'somfy' }).unitPrice).toBe(5_940_000);
  });

  it('matches the worked example of the spec', () => {
    // 3.2 m x 450,000 x 1.2 x 1.15 = 1,987,200 + 4,500,000 motor -> 6,487,000 after rounding.
    const result = priceOf(curtain, { pleatId: 'triple', fullness: 2.3, motorId: 'somfy', quantity: 2 });

    expect(result.unitPrice).toBe(6_487_000);
    expect(result.lineTotal).toBe(12_974_000);
  });
});

describe('calculatePrice: square meter', () => {
  it('is width x height x price per m2, without pleat or fullness', () => {
    const result = priceOf(blind, { widthCm: 150, heightCm: 200, pleatId: 'triple', fullness: 2.3 });

    expect(result.unitPrice).toBe(1_140_000); // 1.5 x 2 x 380,000
    expect(result.multiplier).toBe(1);
    expect(result.pleat).toBeNull();
    expect(result.fullness).toBeNull();
  });

  it('bills at least 1 m on each side', () => {
    expect(priceOf(blind, { widthCm: 60, heightCm: 80 }).unitPrice).toBe(380_000);
    expect(priceOf(blind, { widthCm: 60, heightCm: 200 }).unitPrice).toBe(760_000);
  });
});

describe('calculatePrice: validation and fallbacks', () => {
  it('rejects sizes and quantities outside the limits', () => {
    expect(calculatePrice(curtain, config({ widthCm: 29 }))).toEqual({ ok: false, error: 'width' });
    expect(calculatePrice(curtain, config({ widthCm: Number.NaN }))).toEqual({ ok: false, error: 'width' });
    expect(calculatePrice(curtain, config({ heightCm: 601 }))).toEqual({ ok: false, error: 'height' });
    expect(calculatePrice(curtain, config({ quantity: 0 }))).toEqual({ ok: false, error: 'quantity' });
    expect(calculatePrice(curtain, config({ quantity: 1.5 }))).toEqual({ ok: false, error: 'quantity' });
    expect(calculatePrice(curtain, config({ quantity: 21 }))).toEqual({ ok: false, error: 'quantity' });
  });

  it('falls back to neutral values for option ids that no longer exist', () => {
    const result = priceOf(curtain, { pleatId: 'gone', fabricId: 'gone', motorId: 'gone', fullness: 9 as never });

    expect(result.unitPrice).toBe(1_440_000);
    expect(result.pleat?.id).toBe('wave');
    expect(result.fabric?.id).toBe('linen');
    expect(result.motor).toBeNull();
    expect(result.fullness).toBe(2);
  });

  it('prices a product without any option', () => {
    const bare: Priced = { ...curtain, pleat_options: [], fabric_options: [], motor_options: [] };

    expect(priceOf(bare).unitPrice).toBe(1_440_000);
  });
});

describe('sale price', () => {
  it('replaces the base price per meter, with options still added on top', () => {
    const onSale: Priced = { ...curtain, sale_price: 360_000 };

    // 3.2 m * 360,000
    expect(priceOf(onSale)).toMatchObject({
      unitPrice: 1_152_000,
      originalUnitPrice: 1_440_000,
      pricePerUnit: 360_000,
    });
    // 3.2 m * (360,000 + 120,000) * 1.2 + 4,500,000, against 3.2 m * (450,000 + 120,000) * 1.2 + 4,500,000
    expect(priceOf(onSale, { pleatId: 'triple', fabricId: 'velvet', motorId: 'somfy' })).toMatchObject({
      unitPrice: 6_343_000,
      originalUnitPrice: 6_689_000,
    });
  });

  it('applies to square-meter products', () => {
    // 3.2 m * 2.6 m * 300,000, against * 380,000
    expect(priceOf({ ...blind, sale_price: 300_000 })).toMatchObject({
      unitPrice: 2_496_000,
      originalUnitPrice: 3_162_000,
    });
  });

  it('reports no original price for a product that is not discounted', () => {
    expect(priceOf(curtain).originalUnitPrice).toBeNull();
  });

  it.each([450_000, 500_000, -1, Number.NaN])('ignores a sale price of %d (not below the base price)', (sale_price) => {
    const product: Priced = { ...curtain, sale_price };

    expect(getSalePrice(product)).toBeNull();
    expect(getEffectivePrice(product)).toBe(450_000);
    expect(getDiscountPercent(product)).toBe(0);
    expect(priceOf(product)).toMatchObject({ unitPrice: 1_440_000, originalUnitPrice: null });
  });

  it('rounds the discount to a whole percent, never down to zero', () => {
    expect(getDiscountPercent({ base_price: 450_000, sale_price: 360_000 })).toBe(20);
    expect(getDiscountPercent({ base_price: 450_000, sale_price: 299_000 })).toBe(34);
    expect(getDiscountPercent({ base_price: 450_000, sale_price: 449_000 })).toBe(1);
    expect(getDiscountPercent({ base_price: 450_000, sale_price: 0 })).toBe(100);
  });
});
