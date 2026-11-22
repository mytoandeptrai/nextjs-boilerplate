import { SETTING_KEYS } from '@/constants/const';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { IBlogPost, ICategory, ILookbook, IProduct } from '@/types/catalog';
import { toBlogPost, toLookbook, toProduct } from './schema';

/**
 * Public catalogue reads with the anon client (row level security: active products, published guides, public
 * settings). They never throw: when Supabase is unreachable or not configured the storefront shows an empty state.
 */
const safe = async <T>(
  run: (db: NonNullable<ReturnType<typeof getSupabaseClient>>) => PromiseLike<{ data: unknown; error: unknown }>,
  map: (data: any) => T,
  fallback: T
): Promise<T> => {
  const db = getSupabaseClient();

  if (!db) return fallback;

  try {
    const { data, error } = await run(db);

    if (error || data === null || data === undefined) {
      if (error) console.error('[catalog]', (error as { message?: string }).message ?? error);

      return fallback;
    }

    return map(data);
  } catch (error) {
    console.error('[catalog]', error);

    return fallback;
  }
};

export const getCategories = (): Promise<ICategory[]> =>
  safe(
    (db) => db.from('categories').select('*').order('display_order'),
    (rows: ICategory[]) => rows,
    []
  );

export const getProducts = ({ categoryId, limit }: { categoryId?: string; limit?: number } = {}): Promise<IProduct[]> =>
  safe(
    (db) => {
      let query = db.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });

      if (categoryId) query = query.eq('category_id', categoryId);
      if (limit) query = query.limit(limit);

      return query;
    },
    (rows: Record<string, unknown>[]) => rows.map(toProduct),
    []
  );

/**
 * One page of the catalogue with the number of matching products. A page past the end comes back empty with
 * `total: 0` (PostgREST refuses the range), which the catalogue treats as "go back to the first page".
 */
export const getProductsPage = ({
  categoryId,
  page,
  pageSize,
}: {
  categoryId?: string;
  page: number;
  pageSize: number;
}): Promise<{ products: IProduct[]; total: number }> => {
  const db = getSupabaseClient();
  const empty = { products: [], total: 0 };

  if (!db) return Promise.resolve(empty);

  let query = db
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    // Products created in the same instant must not swap places between pages.
    .order('id')
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (categoryId) query = query.eq('category_id', categoryId);

  return Promise.resolve(query).then(
    ({ data, error, count }) => {
      if (error || !data) {
        // PGRST103: the requested range starts after the last row.
        if (error && error.code !== 'PGRST103') console.error('[catalog]', error.message);

        return empty;
      }

      return { products: (data as Record<string, unknown>[]).map(toProduct), total: count ?? data.length };
    },
    (error) => {
      console.error('[catalog]', error);

      return empty;
    }
  );
};

export const getProductBySlug = (slug: string): Promise<IProduct | null> =>
  safe((db) => db.from('products').select('*').eq('slug', slug).eq('is_active', true).maybeSingle(), toProduct, null);

export const getProductsByIds = (ids: string[]): Promise<IProduct[]> =>
  ids.length
    ? safe(
        (db) => db.from('products').select('*').in('id', ids).eq('is_active', true),
        (rows: Record<string, unknown>[]) => rows.map(toProduct),
        []
      )
    : Promise.resolve([]);

export const getLookbooks = ({ limit }: { limit?: number } = {}): Promise<ILookbook[]> =>
  safe(
    (db) => {
      const query = db.from('lookbooks').select('*').order('created_at', { ascending: false });

      return limit ? query.limit(limit) : query;
    },
    (rows: Record<string, unknown>[]) => rows.map(toLookbook),
    []
  );

/** Lookbook photos that tag a product (shown as "seen in real homes" on the product page). */
export const getLookbooksByProduct = (productId: string): Promise<ILookbook[]> =>
  safe(
    (db) =>
      db
        .from('lookbooks')
        .select('*')
        .contains('tagged_product_ids', [productId])
        .order('created_at', { ascending: false })
        .limit(6),
    (rows: Record<string, unknown>[]) => rows.map(toLookbook),
    []
  );

export const getPosts = ({ limit }: { limit?: number } = {}): Promise<IBlogPost[]> =>
  safe(
    (db) => {
      const query = db.from('blog_posts').select('*').order('published_at', { ascending: false });

      return limit ? query.limit(limit) : query;
    },
    (rows: Record<string, unknown>[]) => rows.map(toBlogPost),
    []
  );

export const getPostBySlug = (slug: string): Promise<IBlogPost | null> =>
  safe((db) => db.from('blog_posts').select('*').eq('slug', slug).maybeSingle(), toBlogPost, null);

/** Zalo hotline shown on the storefront; empty when it is not set. */
export const getZaloHotline = (): Promise<string> =>
  safe(
    (db) => db.from('site_settings').select('value').eq('key', SETTING_KEYS.ZALO_HOTLINE).maybeSingle(),
    (row: { value: string }) => row.value ?? '',
    ''
  );
