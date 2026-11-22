import 'server-only';

import { revalidatePath } from 'next/cache';

/** Drop every cached storefront page after an admin change, so it is visible at once instead of a minute later. */
export const revalidateStorefront = () => revalidatePath('/', 'layout');
