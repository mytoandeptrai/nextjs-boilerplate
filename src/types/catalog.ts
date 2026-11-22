import type { Fullness, QuoteStatus } from '@/constants/const';

export type PricingType = 'linear_meter' | 'square_meter';

export interface ICategory {
  id: string;
  slug: string;
  title: string;
  display_order: number;
}

/** `multiplier` applies to linear-meter pricing only. */
export interface IPleatOption {
  id: string;
  label: string;
  multiplier: number;
}

/** `price_delta` is added to the product's base price (VND per m, or per m2). */
export interface IFabricOption {
  id: string;
  label: string;
  color?: string;
  price_delta: number;
}

export interface IMotorOption {
  id: string;
  label: string;
  price: number;
}

export interface IProduct {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  description: string;
  base_price: number;
  pricing_type: PricingType;
  pleat_options: IPleatOption[];
  fabric_options: IFabricOption[];
  motor_options: IMotorOption[];
  images: string[];
  is_active: boolean;
  created_at: string;
}

export interface ILookbook {
  id: string;
  title: string;
  description: string;
  image_url: string;
  tagged_product_ids: string[];
  created_at: string;
}

export interface IBlogPost {
  id: string;
  title: string;
  slug: string;
  content_markdown: string;
  thumbnail_url: string | null;
  /** `null` = draft. */
  published_at: string | null;
}

/** What the customer chose in the configurator. Prices are always recomputed from the product. */
export interface IConfiguration {
  widthCm: number;
  heightCm: number;
  pleatId: string | null;
  fullness: Fullness;
  fabricId: string | null;
  motorId: string | null;
  quantity: number;
}

/** A cart line: the configuration plus a snapshot of the product, so the cart renders without a request. */
export interface ICartItem extends IConfiguration {
  /** Line id (not the product id): the same product can be in the cart with different sizes. */
  id: string;
  productId: string;
  slug: string;
  title: string;
  image: string | null;
  pricingType: PricingType;
  pleat: IPleatOption | null;
  fabric: IFabricOption | null;
  motor: IMotorOption | null;
  unitPrice: number;
}

/** A line as stored in `quote_requests.cart_items` (snake_case, like every database payload). */
export interface IQuoteLine {
  product_id: string;
  slug: string;
  title: string;
  image: string | null;
  pricing_type: PricingType;
  width_cm: number;
  height_cm: number;
  pleat: IPleatOption | null;
  fullness: number | null;
  fabric: IFabricOption | null;
  motor: IMotorOption | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export type QuoteChannel = 'zalo' | 'email';

export interface IQuoteRequest {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  notes: string;
  cart_items: IQuoteLine[];
  total_estimate: number;
  status: QuoteStatus;
  channel: QuoteChannel;
  created_at: string;
}
