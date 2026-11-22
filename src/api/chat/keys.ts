/** Path under `/api` (see `src/app/api/chat`) and the matching query key. */
export const CHAT_KEYS = {
  SEND: '/chat',
  status: ['chat', 'status'] as const,
} as const;
