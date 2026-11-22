import { z } from 'zod';

import type { IBlogPost, ILookbook, IProduct } from '@/types/catalog';

export const pleatOptionSchema = z.object({
  id: z.string().min(1).max(60),
  label: z.string().min(1).max(80),
  multiplier: z.coerce.number().min(0.1).max(5),
});

export const fabricOptionSchema = z.object({
  id: z.string().min(1).max(60),
  label: z.string().min(1).max(80),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  price_delta: z.coerce.number().min(0).max(1_000_000_000),
});

export const motorOptionSchema = z.object({
  id: z.string().min(1).max(60),
  label: z.string().min(1).max(80),
  price: z.coerce.number().min(0).max(1_000_000_000),
});

/** JSONB can be edited outside the admin: keep the valid entries and drop the rest instead of failing the page. */
const parseList = <T>(schema: z.ZodType<T>, value: unknown): T[] =>
  Array.isArray(value)
    ? value.flatMap((entry) => {
        const parsed = schema.safeParse(entry);

        return parsed.success ? [parsed.data] : [];
      })
    : [];

type Row = Record<string, unknown>;

/** Normalise a `products` row: numeric columns arrive as numbers or strings, JSONB as anything. */
export const toProduct = (row: Row): IProduct => ({
  id: String(row.id),
  title: String(row.title ?? ''),
  slug: String(row.slug ?? ''),
  category_id: (row.category_id as string | null) ?? null,
  description: String(row.description ?? ''),
  base_price: Number(row.base_price) || 0,
  pricing_type: row.pricing_type === 'square_meter' ? 'square_meter' : 'linear_meter',
  pleat_options: parseList(pleatOptionSchema, row.pleat_options),
  fabric_options: parseList(fabricOptionSchema, row.fabric_options),
  motor_options: parseList(motorOptionSchema, row.motor_options),
  images: Array.isArray(row.images) ? row.images.filter((url): url is string => typeof url === 'string') : [],
  is_active: row.is_active !== false,
  created_at: String(row.created_at ?? ''),
});

export const toLookbook = (row: Row): ILookbook => ({
  id: String(row.id),
  title: String(row.title ?? ''),
  description: String(row.description ?? ''),
  image_url: String(row.image_url ?? ''),
  tagged_product_ids: Array.isArray(row.tagged_product_ids) ? (row.tagged_product_ids as string[]) : [],
  created_at: String(row.created_at ?? ''),
});

export const toBlogPost = (row: Row): IBlogPost => ({
  id: String(row.id),
  title: String(row.title ?? ''),
  slug: String(row.slug ?? ''),
  content_markdown: String(row.content_markdown ?? ''),
  thumbnail_url: (row.thumbnail_url as string | null) || null,
  published_at: (row.published_at as string | null) ?? null,
});
