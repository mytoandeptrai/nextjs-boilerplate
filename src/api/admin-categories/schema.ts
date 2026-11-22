import { z } from 'zod';

import { SLUG_REGEX } from '@/api/admin-products/schema';

/** A category as the admin dialog sends it. Validated again in the Route Handler. */
export const categorySchema = z.object({
  title: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(80).regex(SLUG_REGEX),
  display_order: z.coerce.number().int().min(0).max(9999),
});

export type CategoryFormInput = z.input<typeof categorySchema>;
export type CategoryBody = z.output<typeof categorySchema>;
