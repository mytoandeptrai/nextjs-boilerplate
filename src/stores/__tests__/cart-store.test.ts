import type { ICartItem } from '@/types/catalog';
import { selectCartCount, selectCartTotal, useCartStore } from '../cart-store';

const item = (overrides: Partial<ICartItem> = {}): ICartItem => ({
  id: 'line-1',
  productId: 'p1',
  slug: 'rem-vai-linen',
  title: 'Rèm vải Linen',
  image: null,
  pricingType: 'linear_meter',
  widthCm: 320,
  heightCm: 260,
  pleatId: 'wave',
  fullness: 2,
  fabricId: 'linen',
  motorId: null,
  quantity: 1,
  pleat: { id: 'wave', label: 'Ly sóng', multiplier: 1 },
  fabric: { id: 'linen', label: 'Linen', price_delta: 0 },
  motor: null,
  unitPrice: 1_440_000,
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ items: [], isOpen: false });
});

describe('cart store', () => {
  it('merges identical configurations into one line and keeps different sizes apart', () => {
    const { addItem } = useCartStore.getState();

    addItem(item());
    addItem(item({ id: 'line-2', quantity: 2 }));
    addItem(item({ id: 'line-3', widthCm: 200, unitPrice: 900_000 }));

    const state = useCartStore.getState();

    expect(state.items).toHaveLength(2);
    expect(state.items[0]).toMatchObject({ id: 'line-1', quantity: 3 });
    expect(selectCartCount(state)).toBe(4);
    expect(selectCartTotal(state)).toBe(3 * 1_440_000 + 900_000);
  });

  it('clamps quantities to the allowed range', () => {
    const { addItem, setQuantity } = useCartStore.getState();

    addItem(item());
    setQuantity('line-1', 99);
    expect(useCartStore.getState().items[0].quantity).toBe(20);
    setQuantity('line-1', 0);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('replaces, removes and clears lines', () => {
    const { addItem, replaceItem, removeItem, clear } = useCartStore.getState();

    addItem(item());
    addItem(item({ id: 'line-2', productId: 'p2' }));
    replaceItem(item({ unitPrice: 1_500_000 }));
    expect(useCartStore.getState().items[0].unitPrice).toBe(1_500_000);

    removeItem('line-1');
    expect(useCartStore.getState().items.map((line) => line.id)).toEqual(['line-2']);

    clear();
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('persists only the lines and drops corrupt entries when rehydrating', async () => {
    useCartStore.getState().addItem(item());
    useCartStore.getState().setOpen(true);

    const stored = JSON.parse(localStorage.getItem('cart-store') ?? '{}');

    expect(stored.state).toEqual({ items: [expect.objectContaining({ id: 'line-1' })] });

    // Writing to the store also writes to storage, so empty it first and then plant the corrupt payload.
    useCartStore.setState({ items: [] });
    localStorage.setItem(
      'cart-store',
      JSON.stringify({ version: 1, state: { items: [item(), { id: 'broken' }, null] } })
    );
    await useCartStore.persist.rehydrate();

    expect(useCartStore.getState().items.map((line) => line.id)).toEqual(['line-1']);
  });
});
