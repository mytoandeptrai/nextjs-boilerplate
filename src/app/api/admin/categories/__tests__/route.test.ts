import { DELETE, PUT } from '../[id]/route';
import { GET, POST } from '../route';

const CATEGORY_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_ID = '22222222-2222-4222-8222-222222222222';

const categories = [
  { id: CATEGORY_ID, slug: 'rem-vai', title: 'Rèm vải', display_order: 1 },
  { id: OTHER_ID, slug: 'rem-go', title: 'Rèm gỗ', display_order: 2 },
];
const write = vi.fn();
const revalidateStorefront = vi.fn();

/** A PostgREST builder stand-in: a promise of `result` whose filter methods return itself. */
const builder = (result: { data: unknown; error: unknown }) => {
  const chain = Promise.resolve(result) as Promise<typeof result> & Record<string, () => unknown>;

  for (const method of ['select', 'order', 'not', 'eq', 'single']) chain[method] = () => chain;

  return chain;
};

vi.mock('server-only', () => ({}));
// Authentication is covered by the `withAdmin` tests; here the handler is called directly.
vi.mock('@/lib/server/admin-session', () => ({ withAdmin: (handler: unknown) => handler }));
vi.mock('@/lib/server/revalidate', () => ({ revalidateStorefront: () => revalidateStorefront() }));
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => ({
      select: () =>
        builder({
          data: table === 'categories' ? categories : [{ category_id: CATEGORY_ID }, { category_id: CATEGORY_ID }],
          error: null,
        }),
      insert: (body: unknown) => builder(write('insert', body)),
      update: (body: unknown) => builder(write('update', body)),
      delete: () => builder(write('delete')),
    }),
  }),
}));

const request = (body?: unknown, method = 'POST') =>
  new Request('http://localhost/api/admin/categories', {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const context = (id: string) => ({ params: Promise.resolve({ id }) });
const valid = { title: ' Rèm sáo ', slug: 'rem-sao', display_order: '5' };

beforeEach(() => {
  vi.clearAllMocks();
  write.mockImplementation((_action: string, body?: object) => ({ data: { id: OTHER_ID, ...body }, error: null }));
});

describe('admin categories routes', () => {
  it('lists categories with the number of products in each', async () => {
    const response = await (GET as (req: Request) => Promise<Response>)(request(undefined, 'GET'));

    expect(await response.json()).toEqual([
      { ...categories[0], product_count: 2 },
      { ...categories[1], product_count: 0 },
    ]);
  });

  it('creates a category from a trimmed, coerced body and refreshes the storefront', async () => {
    const response = await (POST as (req: Request) => Promise<Response>)(request(valid));

    expect(response.status).toBe(201);
    expect(write).toHaveBeenCalledWith('insert', { title: 'Rèm sáo', slug: 'rem-sao', display_order: 5 });
    expect(revalidateStorefront).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['an empty title', { ...valid, title: '  ' }],
    ['a slug with spaces or capitals', { ...valid, slug: 'Rem Sao' }],
    ['a negative order', { ...valid, display_order: -1 }],
  ])('rejects %s before touching the database', async (_label, body) => {
    await expect((POST as (req: Request) => Promise<Response>)(request(body))).rejects.toMatchObject({ status: 400 });
    expect(write).not.toHaveBeenCalled();
  });

  it('reports a duplicate slug as a conflict', async () => {
    write.mockReturnValue({ data: null, error: { code: '23505' } });

    await expect((POST as (req: Request) => Promise<Response>)(request(valid))).rejects.toMatchObject({ status: 409 });
    expect(revalidateStorefront).not.toHaveBeenCalled();
  });

  it('updates and deletes by id', async () => {
    const updated = await PUT(request(valid, 'PUT') as never, context(CATEGORY_ID));
    const deleted = await DELETE(request(undefined, 'DELETE') as never, context(CATEGORY_ID));

    expect(updated.status).toBe(200);
    expect(write).toHaveBeenCalledWith('update', { title: 'Rèm sáo', slug: 'rem-sao', display_order: 5 });
    expect(deleted.status).toBe(204);
    expect(write).toHaveBeenCalledWith('delete');
    expect(revalidateStorefront).toHaveBeenCalledTimes(2);
  });

  it('answers 404 for an id that is not a uuid', async () => {
    await expect(DELETE(request(undefined, 'DELETE') as never, context('1 or 1=1'))).rejects.toMatchObject({
      status: 404,
    });
    expect(write).not.toHaveBeenCalled();
  });
});
