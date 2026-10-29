import 'server-only';

import type { IItem1 } from '@/api/item1/type';
import type { IPaginatedListResponse } from '@/types/type';

const now = () => new Date().toISOString();

// In-memory mock backend (kept from the original boilerplate). Replace with `backendRequest` calls to go live.
const items: IItem1[] = [
  { id: '1', name: 'Item 1', createdAt: now(), updatedAt: now() },
  { id: '2', name: 'Item 2', createdAt: now(), updatedAt: now() },
  { id: '3', name: 'Item 3', createdAt: now(), updatedAt: now() },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const item1Mock = {
  async find(params: { page?: number; limit?: number; name?: string }): Promise<IPaginatedListResponse<IItem1>> {
    await delay(500);

    const filtered = params.name
      ? items.filter((item) => item.name.toLowerCase().includes(params.name!.toLowerCase()))
      : [...items];
    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      items: paginated,
      meta: {
        total: filtered.length,
        count: paginated.length,
        per_page: limit,
        current_page: page,
        total_pages: Math.ceil(filtered.length / limit),
      },
    };
  },

  async get(id: string): Promise<IItem1 | undefined> {
    await delay(500);

    return items.find((item) => item.id === id);
  },

  async create(data: { name: string }): Promise<IItem1> {
    await delay(500);

    const item: IItem1 = {
      id: Math.random().toString(36).slice(2, 11),
      name: data.name,
      createdAt: now(),
      updatedAt: now(),
    };
    items.push(item);

    return item;
  },

  async update(id: string, data: { name: string }): Promise<IItem1 | undefined> {
    await delay(500);

    const index = items.findIndex((item) => item.id === id);

    if (index === -1) return undefined;

    items[index] = { ...items[index], name: data.name, updatedAt: now() };

    return items[index];
  },

  async remove(id: string): Promise<boolean> {
    await delay(500);

    const index = items.findIndex((item) => item.id === id);

    if (index === -1) return false;

    items.splice(index, 1);

    return true;
  },
};
