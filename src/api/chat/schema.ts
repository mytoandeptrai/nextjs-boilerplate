import { z } from 'zod';

import { LOCALES } from '@/i18n/routing';

export const CHAT_LIMITS = {
  /** Characters in one message. */
  messageLength: 1000,
  /** Messages sent as context; the widget only sends the most recent ones. */
  historyLength: 20,
} as const;

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z
    .string()
    .trim()
    .min(1)
    .max(CHAT_LIMITS.messageLength * 4),
});

/** The conversation so far, ending with the customer's new message. */
export const chatBodySchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1)
    .max(CHAT_LIMITS.historyLength)
    .refine((messages) => messages.at(-1)?.role === 'user', 'The last message must come from the customer')
    .refine(
      (messages) => (messages.at(-1)?.content.length ?? 0) <= CHAT_LIMITS.messageLength,
      'The message is too long'
    ),
  locale: z.enum(LOCALES),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatBody = z.infer<typeof chatBodySchema>;
