import { calculatePrice } from '@/lib/pricing';
import type { ICartItem, IConfiguration, IProduct, IQuoteLine } from '@/types/catalog';

/**
 * Price one configured product and return the line stored in `quote_requests.cart_items`.
 * Used by the browser (Zalo message) and by `POST /api/quotes`, so both always agree. `null` when the size or
 * quantity is out of range.
 */
export const toQuoteLine = (product: IProduct, config: IConfiguration): IQuoteLine | null => {
  const price = calculatePrice(product, config);

  if (!price.ok) return null;

  return {
    product_id: product.id,
    slug: product.slug,
    title: product.title,
    image: product.images[0] ?? null,
    pricing_type: product.pricing_type,
    width_cm: config.widthCm,
    height_cm: config.heightCm,
    pleat: price.pleat,
    fullness: price.fullness,
    fabric: price.fabric,
    motor: price.motor,
    quantity: config.quantity,
    unit_price: price.unitPrice,
    line_total: price.lineTotal,
  };
};

/** The same line built from the cart snapshot, for when the current product data could not be loaded. */
export const cartItemToQuoteLine = (item: ICartItem): IQuoteLine => ({
  product_id: item.productId,
  slug: item.slug,
  title: item.title,
  image: item.image,
  pricing_type: item.pricingType,
  width_cm: item.widthCm,
  height_cm: item.heightCm,
  pleat: item.pleat,
  fullness: item.pricingType === 'linear_meter' ? item.fullness : null,
  fabric: item.fabric,
  motor: item.motor,
  quantity: item.quantity,
  unit_price: item.unitPrice,
  line_total: item.unitPrice * item.quantity,
});

/** Snapshot of a priced configuration, as stored in the cart. */
export const toCartItem = (product: IProduct, config: IConfiguration, id: string): ICartItem | null => {
  const price = calculatePrice(product, config);

  if (!price.ok) return null;

  return {
    ...config,
    id,
    productId: product.id,
    slug: product.slug,
    title: product.title,
    image: product.images[0] ?? null,
    pricingType: product.pricing_type,
    // Store the options that were actually applied, so the cart shows what was priced.
    pleatId: price.pleat?.id ?? null,
    fabricId: price.fabric?.id ?? null,
    motorId: price.motor?.id ?? null,
    pleat: price.pleat,
    fabric: price.fabric,
    motor: price.motor,
    unitPrice: price.unitPrice,
  };
};
