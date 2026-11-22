import { getProductsByIds } from '@/api/catalog/requests';
import { quoteBodySchema } from '@/api/quotes/schema';
import type { ICreateQuoteResponse, IUnavailableProductsError } from '@/api/quotes/type';
import { SETTING_KEYS } from '@/constants/const';
import { env } from '@/constants/env';
import { HttpStatus } from '@/enums/enum';
import { normalizeFullness } from '@/lib/pricing';
import { toQuoteLine } from '@/lib/quote';
import { UNIQUE_VIOLATION } from '@/lib/server/db-error';
import { sendQuoteAlert } from '@/lib/server/email';
import { getClientIp, isRateLimited, isSameOrigin } from '@/lib/server/rate-limit';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { IQuoteLine } from '@/types/catalog';

const RATE_LIMIT = { max: 5, windowMs: 10 * 60_000 };

const json = (body: unknown, status: number) => Response.json(body, { status });

const getNotificationEmail = async (): Promise<string> => {
  try {
    const { data } = await getSupabaseAdmin()
      .from('site_settings')
      .select('value')
      .eq('key', SETTING_KEYS.QUOTE_NOTIFICATION_EMAIL)
      .maybeSingle();

    return data?.value ?? '';
  } catch {
    return '';
  }
};

/**
 * Lead capture for both checkout buttons. The browser sends ids and sizes; every price is recomputed here from the
 * database, so a tampered total is never stored.
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req, env.APP_URL)) return json({ message: 'Cross-origin request rejected' }, HttpStatus.FORBIDDEN);

  const parsed = quoteBodySchema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) return json({ message: parsed.error.issues[0]?.message }, HttpStatus.BAD_REQUEST);

  const body = parsed.data;

  // A bot filled the hidden field: answer like a success and store nothing.
  if (body.website)
    return json({ id: body.id, totalEstimate: 0, emailSent: false } satisfies ICreateQuoteResponse, HttpStatus.CREATED);

  if (isRateLimited(`quotes:${getClientIp(req.headers)}`, RATE_LIMIT.max, RATE_LIMIT.windowMs))
    return json({ message: 'Too many requests. Please try again later.' }, HttpStatus.TOO_MANY_REQUESTS);

  const db = getSupabaseClient();

  if (!db) return json({ message: 'Supabase is not configured' }, HttpStatus.SERVICE_UNAVAILABLE);

  const products = await getProductsByIds([...new Set(body.items.map((item) => item.productId))]);
  const byId = new Map(products.map((product) => [product.id, product]));
  const unavailableProductIds = [
    ...new Set(body.items.filter((item) => !byId.has(item.productId)).map((item) => item.productId)),
  ];

  if (unavailableProductIds.length)
    return json(
      { message: 'Some products are no longer available', unavailableProductIds } satisfies IUnavailableProductsError,
      HttpStatus.CONFLICT
    );

  const lines = body.items.map((item) =>
    toQuoteLine(byId.get(item.productId)!, { ...item, fullness: normalizeFullness(item.fullness) })
  );

  if (lines.some((line) => line === null)) return json({ message: 'Invalid size or quantity' }, HttpStatus.BAD_REQUEST);

  const cartItems = lines as IQuoteLine[];
  const quote = {
    id: body.id,
    customer_name: body.customerName,
    customer_phone: body.customerPhone,
    customer_address: body.customerAddress,
    notes: body.notes,
    cart_items: cartItems,
    total_estimate: cartItems.reduce((total, line) => total + line.line_total, 0),
    channel: body.channel,
  };

  // Insert only, no `select`: the public key has no read access to leads.
  const { error } = await db.from('quote_requests').insert({ ...quote, status: 'new' });

  // The same id again is a retry of a submit that already succeeded: answer success without a second lead or email.
  if (error?.code === UNIQUE_VIOLATION)
    return json(
      { id: quote.id, totalEstimate: quote.total_estimate, emailSent: false } satisfies ICreateQuoteResponse,
      HttpStatus.OK
    );

  if (error) {
    console.error('[quotes] insert failed', error.code, error.message);

    return json({ message: 'Could not save the request' }, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  const emailSent = body.channel === 'email' ? await sendQuoteAlert(await getNotificationEmail(), quote) : false;

  return json(
    { id: quote.id, totalEstimate: quote.total_estimate, emailSent } satisfies ICreateQuoteResponse,
    HttpStatus.CREATED
  );
}
