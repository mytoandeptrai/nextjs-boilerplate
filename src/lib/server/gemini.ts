import 'server-only';

import { serverEnv } from '@/constants/env.server';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
/** Gemini can hold a request for minutes before answering 503; the customer should not wait that long. */
const TIMEOUT_MS = 15_000;
/** Quota exhausted, model overloaded or gateway trouble: all "try again in a moment" for the customer. */
const OVERLOADED_STATUSES = new Set([429, 500, 502, 503, 504]);
const RETRIED_STATUSES = new Set([500, 502, 503, 504]);

export interface IGeminiPart {
  text?: string;
  functionCall?: { name: string; args?: Record<string, unknown>; id?: string };
  functionResponse?: { name: string; id?: string; response: Record<string, unknown> };
  /** Opaque fields (thought signatures) that have to be sent back unchanged. */
  [key: string]: unknown;
}

export interface IGeminiContent {
  role: 'user' | 'model';
  parts: IGeminiPart[];
}

export interface IGeminiRequest {
  system: string;
  contents: IGeminiContent[];
  tools?: { name: string; description: string; parameters: Record<string, unknown> }[];
}

/**
 * `overloaded`: quota or capacity, worth retrying later. `unavailable`: no API key. `failed`: anything else
 * (bad key, blocked prompt, unexpected answer).
 */
export class GeminiError extends Error {
  constructor(
    readonly reason: 'overloaded' | 'unavailable' | 'failed',
    message: string
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

export const isGeminiConfigured = (): boolean => Boolean(serverEnv.GEMINI_API_KEY);

/** One `generateContent` call. Returns the model turn, which may hold text or function calls. */
export const generateContent = async ({ system, contents, tools }: IGeminiRequest): Promise<IGeminiContent> => {
  if (!serverEnv.GEMINI_API_KEY) throw new GeminiError('unavailable', 'GEMINI_API_KEY is not set');

  const request = () =>
    fetch(`${ENDPOINT}/${serverEnv.GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': serverEnv.GEMINI_API_KEY ?? '' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        ...(tools?.length ? { tools: [{ functionDeclarations: tools }] } : {}),
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });

  let response: Response;

  try {
    response = await request();

    // A capacity spike often clears at once: one more try. Not for 429, which is this key's own quota.
    if (RETRIED_STATUSES.has(response.status)) response = await request();
  } catch (error) {
    // Timeout or network failure.
    throw new GeminiError('overloaded', error instanceof Error ? error.message : 'Gemini request failed');
  }

  if (!response.ok) {
    const detail = (await response.text().catch(() => '')).slice(0, 300);

    throw new GeminiError(
      OVERLOADED_STATUSES.has(response.status) ? 'overloaded' : 'failed',
      `Gemini answered ${response.status}: ${detail}`
    );
  }

  const data = (await response.json().catch(() => null)) as {
    candidates?: { content?: { parts?: IGeminiPart[] }; finishReason?: string }[];
  } | null;
  const candidate = data?.candidates?.[0];
  const parts = candidate?.content?.parts;

  if (!parts?.length)
    throw new GeminiError('failed', `Gemini returned no content (${candidate?.finishReason ?? 'empty'})`);

  return { role: 'model', parts };
};
