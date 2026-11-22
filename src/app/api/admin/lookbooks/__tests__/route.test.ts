import { PUT } from '../[id]/route';
import { POST } from '../route';

const LOOKBOOK_ID = '11111111-1111-4111-8111-111111111111';
const CATEGORY_ID = '22222222-2222-4222-8222-222222222222';
const IMAGE = 'https://example.supabase.co/storage/v1/object/public/bucket/lookbooks/a.jpg';

const write = vi.fn();
const revalidateStorefront = vi.fn();

/** A PostgREST builder stand-in: a promise of `result` whose filter methods return itself. */
const builder = (result: { data: unknown; error: unknown }) => {
  const chain = Promise.resolve(result) as Promise<typeof result> & Record<string, () => unknown>;

  for (const method of ['select', 'order', 'eq', 'single', 'maybeSingle']) chain[method] = () => chain;

  return chain;
};

vi.mock('server-only', () => ({}));
// Authentication is covered by the `withAdmin` tests; here the handler is called directly.
vi.mock('@/lib/server/admin-session', () => ({ withAdmin: (handler: unknown) => handler }));
vi.mock('@/lib/server/revalidate', () => ({ revalidateStorefront: () => revalidateStorefront() }));
vi.mock('@/lib/server/storage', () => ({ removeImages: vi.fn() }));
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      select: () => builder({ data: { id: LOOKBOOK_ID, image_url: IMAGE }, error: null }),
      insert: (body: unknown) => builder(write('insert', body)),
      update: (body: unknown) => builder(write('update', body)),
    }),
  }),
}));

const request = (body: unknown, method = 'POST') =>
  new Request('http://localhost/api/admin/lookbooks', { method, body: JSON.stringify(body) });
const context = { params: Promise.resolve({ id: LOOKBOOK_ID }) };
const valid = {
  title: ' Rèm vải phòng khách ',
  category_id: CATEGORY_ID,
  description: '',
  image_url: IMAGE,
  tagged_product_ids: [],
};

type Handler = (req: Request, context?: unknown) => Promise<Response>;

beforeEach(() => {
  vi.clearAllMocks();
  write.mockImplementation((_action: string, body?: object) => ({ data: { id: LOOKBOOK_ID, ...body }, error: null }));
});

describe('admin lookbooks routes', () => {
  it('creates a photo filed under a category and refreshes the storefront', async () => {
    const response = await (POST as Handler)(request(valid));

    expect(response.status).toBe(201);
    expect(write).toHaveBeenCalledWith('insert', { ...valid, title: 'Rèm vải phòng khách' });
    expect((await response.json()).category_id).toBe(CATEGORY_ID);
    expect(revalidateStorefront).toHaveBeenCalledTimes(1);
  });

  it('accepts a photo without a category', async () => {
    const response = await (POST as Handler)(request({ ...valid, category_id: null }));

    expect(response.status).toBe(201);
    expect((await response.json()).category_id).toBeNull();
  });

  it.each([
    ['a missing category field', { ...valid, category_id: undefined }],
    ['a category that is not a uuid', { ...valid, category_id: 'rem-vai' }],
  ])('rejects %s before touching the database', async (_label, body) => {
    await expect((POST as Handler)(request(body))).rejects.toMatchObject({ status: 400 });
    expect(write).not.toHaveBeenCalled();
  });

  it('moves a photo to another category on update', async () => {
    const response = await (PUT as Handler)(request({ ...valid, category_id: null }, 'PUT'), context);

    expect(response.status).toBe(200);
    expect(write).toHaveBeenCalledWith('update', expect.objectContaining({ category_id: null }));
  });
});
