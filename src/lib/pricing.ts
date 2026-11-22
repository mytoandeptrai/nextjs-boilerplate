import { CONFIGURATOR_LIMITS, FULLNESS_OPTIONS, type Fullness } from '@/constants/const';
import type { IConfiguration, IFabricOption, IMotorOption, IPleatOption, IProduct } from '@/types/catalog';

/** Fullness the base price is quoted at: 2.0x costs exactly the base price, 2.3x costs 15% more fabric. */
export const BASE_FULLNESS = 2;
/** Square-meter products are billed for at least 1 m on each side. */
export const MIN_BILLABLE_METERS = 1;

export type PriceError = 'width' | 'height' | 'quantity';

export interface IPriceBreakdown {
  /** Price of one piece, rounded to 1,000 VND. */
  unitPrice: number;
  /** What one piece would cost without the product's discount; `null` when the product is not discounted. */
  originalUnitPrice: number | null;
  /** `unitPrice * quantity`. */
  lineTotal: number;
  /** Price per m (or per m2) after the discount and the fabric surcharge. */
  pricePerUnit: number;
  /** `pleat.multiplier * fullness / 2.0`, or 1 for square-meter products. */
  multiplier: number;
  motorPrice: number;
  pleat: IPleatOption | null;
  fabric: IFabricOption | null;
  motor: IMotorOption | null;
  /** Fullness that was applied (`null` for square-meter products, which have no pleats). */
  fullness: Fullness | null;
}

export type PriceResult = ({ ok: true } & IPriceBreakdown) | { ok: false; error: PriceError };

type PricedProduct = Pick<
  IProduct,
  'base_price' | 'sale_price' | 'pricing_type' | 'pleat_options' | 'fabric_options' | 'motor_options'
>;

type DiscountableProduct = Pick<IProduct, 'base_price' | 'sale_price'>;

/** The sale price when it is a real discount (below the base price), otherwise `null`. */
export const getSalePrice = ({ base_price, sale_price }: DiscountableProduct): number | null =>
  sale_price !== null && Number.isFinite(sale_price) && sale_price >= 0 && sale_price < base_price ? sale_price : null;

/** Price per m (or per m2) the customer pays before options: the sale price when there is one. */
export const getEffectivePrice = (product: DiscountableProduct): number => getSalePrice(product) ?? product.base_price;

/** Whole percent taken off the base price, at least 1 for any discount; 0 when there is none. */
export const getDiscountPercent = (product: DiscountableProduct): number => {
  const salePrice = getSalePrice(product);

  return salePrice === null ? 0 : Math.max(1, Math.round((1 - salePrice / product.base_price) * 100));
};

/** Round half up to the nearest 1,000 VND. */
export const roundToThousand = (value: number): number => Math.round(value / 1000) * 1000;

const inRange = (value: number, { min, max }: { min: number; max: number }) =>
  Number.isFinite(value) && value >= min && value <= max;

const pick = <T extends { id: string }>(options: T[], id: string | null): T | null =>
  options.find((option) => option.id === id) ?? null;

export const normalizeFullness = (value: number): Fullness =>
  (FULLNESS_OPTIONS as readonly number[]).includes(value) ? (value as Fullness) : BASE_FULLNESS;

/**
 * The one pricing function, shared by the configurator, the cart and `POST /api/quotes`.
 *
 * `price_per_meter` / `price_per_m2` is the sale price when the product has one, otherwise the base price.
 *
 * - Linear meter: `width * price_per_meter * pleat_multiplier + motor_price`
 * - Square meter: `max(1, width) * max(1, height) * price_per_m2 + motor_price`
 *
 * Unknown option ids fall back to the neutral value (multiplier 1, delta 0, no motor), so a product whose options
 * were edited after it was added to a cart still gets a price.
 */
export const calculatePrice = (product: PricedProduct, config: IConfiguration): PriceResult => {
  if (!inRange(config.widthCm, CONFIGURATOR_LIMITS.width)) return { ok: false, error: 'width' };
  if (!inRange(config.heightCm, CONFIGURATOR_LIMITS.height)) return { ok: false, error: 'height' };
  if (!Number.isInteger(config.quantity) || !inRange(config.quantity, CONFIGURATOR_LIMITS.quantity))
    return { ok: false, error: 'quantity' };

  const isLinear = product.pricing_type === 'linear_meter';
  const width = config.widthCm / 100;
  const height = config.heightCm / 100;

  const fabric = pick(product.fabric_options, config.fabricId) ?? product.fabric_options[0] ?? null;
  const motor = pick(product.motor_options, config.motorId);
  const pleat = isLinear ? (pick(product.pleat_options, config.pleatId) ?? product.pleat_options[0] ?? null) : null;
  const fullness = isLinear ? normalizeFullness(config.fullness) : null;

  const fabricDelta = fabric?.price_delta ?? 0;
  const pricePerUnit = getEffectivePrice(product) + fabricDelta;
  const motorPrice = motor?.price ?? 0;
  const multiplier = isLinear ? (pleat?.multiplier ?? 1) * ((fullness ?? BASE_FULLNESS) / BASE_FULLNESS) : 1;

  const priceAt = (perUnit: number) =>
    roundToThousand(
      isLinear
        ? width * perUnit * multiplier + motorPrice
        : Math.max(MIN_BILLABLE_METERS, width) * Math.max(MIN_BILLABLE_METERS, height) * perUnit + motorPrice
    );

  const unitPrice = priceAt(pricePerUnit);
  const undiscounted = getSalePrice(product) === null ? null : priceAt(product.base_price + fabricDelta);

  return {
    ok: true,
    unitPrice,
    // Rounding can make a small discount disappear: only report an original price that is really higher.
    originalUnitPrice: undiscounted !== null && undiscounted > unitPrice ? undiscounted : null,
    lineTotal: unitPrice * config.quantity,
    pricePerUnit,
    multiplier,
    motorPrice,
    pleat,
    fabric,
    motor,
    fullness,
  };
};

export const sumLineTotals = (lines: { unitPrice: number; quantity: number }[]): number =>
  lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
