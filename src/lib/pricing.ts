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
  /** `unitPrice * quantity`. */
  lineTotal: number;
  /** Price per m (or per m2) after the fabric surcharge. */
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
  'base_price' | 'pricing_type' | 'pleat_options' | 'fabric_options' | 'motor_options'
>;

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

  const pricePerUnit = product.base_price + (fabric?.price_delta ?? 0);
  const motorPrice = motor?.price ?? 0;
  const multiplier = isLinear ? (pleat?.multiplier ?? 1) * ((fullness ?? BASE_FULLNESS) / BASE_FULLNESS) : 1;

  const raw = isLinear
    ? width * pricePerUnit * multiplier + motorPrice
    : Math.max(MIN_BILLABLE_METERS, width) * Math.max(MIN_BILLABLE_METERS, height) * pricePerUnit + motorPrice;

  const unitPrice = roundToThousand(raw);

  return {
    ok: true,
    unitPrice,
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
