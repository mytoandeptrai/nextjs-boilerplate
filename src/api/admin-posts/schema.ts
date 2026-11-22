import { z } from 'zod';

import { SLUG_REGEX } from '@/api/admin-products/schema';

export const postSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(80).regex(SLUG_REGEX),
  content_markdown: z.string().max(100_000),
  thumbnail_url: z.url().nullable(),
  /** `false` keeps the guide as a draft (`published_at = null`). */
  is_published: z.boolean(),
});

export type PostFormInput = z.input<typeof postSchema>;
export type PostBody = z.output<typeof postSchema>;

/** `is_published` is a form concept: the table stores the publication time (`null` = draft). */
export const toPostRow = ({ is_published, ...post }: PostBody, previousPublishedAt: string | null = null) => ({
  ...post,
  published_at: is_published ? (previousPublishedAt ?? new Date().toISOString()) : null,
});
