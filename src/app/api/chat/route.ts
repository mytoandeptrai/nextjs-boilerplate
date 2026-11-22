import { chatBodySchema } from '@/api/chat/schema';
import type { ChatErrorCode, IChatError, IChatResponse, IChatStatus } from '@/api/chat/type';
import { env } from '@/constants/env';
import { HttpStatus } from '@/enums/enum';
import { answerChat } from '@/lib/server/chat-assistant';
import { GeminiError, isGeminiConfigured } from '@/lib/server/gemini';
import { getClientIp, isRateLimited, isSameOrigin } from '@/lib/server/rate-limit';

/** Every message costs a model call, so one address gets a bounded number of them. */
const RATE_LIMIT = { max: 20, windowMs: 5 * 60_000 };

const ERROR_STATUS: Record<ChatErrorCode, number> = {
  overloaded: HttpStatus.SERVICE_UNAVAILABLE,
  unavailable: HttpStatus.SERVICE_UNAVAILABLE,
  rate_limited: HttpStatus.TOO_MANY_REQUESTS,
  failed: HttpStatus.BAD_GATEWAY,
};

const json = (body: unknown, status: number) => Response.json(body, { status });

const fail = (code: ChatErrorCode, message: string) => json({ message, code } satisfies IChatError, ERROR_STATUS[code]);

/** Read on every request: the key is set where the server runs, not where it is built. */
export const dynamic = 'force-dynamic';

/** Whether the assistant can answer, so the widget only shows where it works. */
export function GET() {
  return json({ enabled: isGeminiConfigured() } satisfies IChatStatus, HttpStatus.OK);
}

/**
 * Storefront chat assistant. The answer is written by Gemini from the public catalogue (products, prices, guides);
 * the API key never leaves the server. `code: 'overloaded'` tells the widget to show its "system is busy" toast.
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req, env.APP_URL)) return json({ message: 'Cross-origin request rejected' }, HttpStatus.FORBIDDEN);

  const parsed = chatBodySchema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) return json({ message: parsed.error.issues[0]?.message }, HttpStatus.BAD_REQUEST);

  if (!isGeminiConfigured()) return fail('unavailable', 'The assistant is not configured');

  if (isRateLimited(`chat:${getClientIp(req.headers)}`, RATE_LIMIT.max, RATE_LIMIT.windowMs))
    return fail('rate_limited', 'Too many messages. Please try again later.');

  try {
    const reply = await answerChat(parsed.data.messages, parsed.data.locale);

    return json({ reply } satisfies IChatResponse, HttpStatus.OK);
  } catch (error) {
    const reason = error instanceof GeminiError ? error.reason : 'failed';

    console.error('[chat]', reason, error instanceof Error ? error.message : error);

    return fail(
      reason,
      reason === 'overloaded'
        ? 'The assistant is overloaded. Please try again later.'
        : 'The assistant could not answer'
    );
  }
}
