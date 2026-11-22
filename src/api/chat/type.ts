/** `GET /api/chat`: whether the assistant has a key on this server. */
export interface IChatStatus {
  enabled: boolean;
}

export interface IChatResponse {
  reply: string;
}

/**
 * Why `POST /api/chat` failed, in the error body next to `message`:
 * `overloaded` (the AI provider is out of quota or capacity, 503), `rate_limited` (too many messages from one
 * address, 429), `unavailable` (the assistant is not configured, 503), `failed` (anything else, 502).
 */
export type ChatErrorCode = 'overloaded' | 'rate_limited' | 'unavailable' | 'failed';

export interface IChatError {
  message: string;
  code: ChatErrorCode;
}
