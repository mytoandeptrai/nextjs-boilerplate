import type { Item1, CreateItem1Request, UpdateItem1Request } from '@/types/item1';
import type { PaginatedListResponse } from '@/types/common';
import { transformPaginatedList } from '@/utils/pagination';

// Mock data
const mockItems: Item1[] = [
  {
    id: '1',
    name: 'Item 1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Item 2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Item 3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const Item1Service = {
  find: async (params: {
    page?: number;
    limit?: number;
    sort?: string[];
    name?: string;
  }) => {
    await delay(500); // Simulate network delay

    let filteredItems = [...mockItems];

    // Apply name filter if provided
    if (params.name) {
      filteredItems = filteredItems.filter((item) => item.name.toLowerCase().includes(params.name!.toLowerCase()));
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    const mockResponse: PaginatedListResponse<Item1> = {
      items: paginatedItems,
      meta: {
        total: filteredItems.length,
        count: paginatedItems.length,
        per_page: limit,
        current_page: page,
        total_pages: Math.ceil(filteredItems.length / limit),
      },
    };

    return transformPaginatedList(mockResponse);
  },

  create: async (data: CreateItem1Request) => {
    await delay(500);
    const newItem: Item1 = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockItems.push(newItem);
    return newItem;
  },

  update: async (data: UpdateItem1Request) => {
    await delay(500);
    const index = mockItems.findIndex((item) => item.id === data.id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    const updatedItem: Item1 = {
      ...mockItems[index],
      name: data.name,
      updatedAt: new Date().toISOString(),
    };
    mockItems[index] = updatedItem;
    return updatedItem;
  },

  delete: async (id: string) => {
    await delay(500);
    const index = mockItems.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    mockItems.splice(index, 1);
    return undefined;
  },

  get: async (id: string) => {
    await delay(500);
    const item = mockItems.find((item) => item.id === id);
    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  },
};
