import { z } from 'zod';

import { fabricOptionSchema, motorOptionSchema, pleatOptionSchema } from '@/api/catalog/schema';

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const PRICE = z.coerce.number().min(0).max(1_000_000_000);

/** A product as the admin form sends it. Validated again in the Route Handler. */
export const productSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    slug: z.string().trim().min(1).max(80).regex(SLUG_REGEX),
    category_id: z.uuid().nullable(),
    description: z.string().max(5000),
    base_price: PRICE,
    // An empty field means the product is not on sale.
    sale_price: z.preprocess(
      (value) => (value === '' || value === undefined ? null : value),
      z.union([z.null(), PRICE])
    ),
    pricing_type: z.enum(['linear_meter', 'square_meter']),
    pleat_options: z.array(pleatOptionSchema).max(20),
    fabric_options: z.array(fabricOptionSchema).max(40),
    motor_options: z.array(motorOptionSchema).max(20),
    images: z.array(z.url()).max(12),
    is_active: z.boolean(),
  })
  .refine((product) => product.sale_price === null || product.sale_price < product.base_price, {
    path: ['sale_price'],
    message: 'sale_price must be lower than base_price',
  });

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductBody = z.output<typeof productSchema>;
