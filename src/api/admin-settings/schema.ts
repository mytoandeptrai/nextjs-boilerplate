import { z } from 'zod';

import { normalizePhone } from '@/lib/format';

export const settingsSchema = z.object({
  /** Empty disables the Zalo button on the storefront. */
  zalo_hotline: z
    .string()
    .transform(normalizePhone)
    .pipe(z.string().regex(/^(\+?\d{8,15})?$/)),
  /** Empty disables the email alert. */
  quote_notification_email: z.union([z.literal(''), z.email()]),
});

export type SettingsFormInput = z.input<typeof settingsSchema>;
export type SettingsBody = z.output<typeof settingsSchema>;
