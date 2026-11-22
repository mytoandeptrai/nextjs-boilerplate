import { z } from 'zod';

export const lookbookSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().max(1000),
  image_url: z.url(),
  tagged_product_ids: z.array(z.uuid()).max(20),
});

export type LookbookFormInput = z.input<typeof lookbookSchema>;
export type LookbookBody = z.output<typeof lookbookSchema>;
