import type { NextRequest } from 'next/server';

import { HttpStatus } from '@/enums/enum';
import { item1Mock } from '@/lib/server/item1-mock';
import { createApiErrorResponse } from '@/utils/api-error';

type RouteContext = { params: Promise<{ id: string }> };

const notFound = () => Response.json({ message: 'Item not found' }, { status: HttpStatus.NOT_FOUND });

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const item = await item1Mock.get((await params).id);

    return item ? Response.json(item) : notFound();
  } catch (error) {
    return createApiErrorResponse(error, 'Failed to fetch item');
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const item = await item1Mock.update((await params).id, await req.json());

    return item ? Response.json(item) : notFound();
  } catch (error) {
    return createApiErrorResponse(error, 'Failed to update item');
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    return (await item1Mock.remove((await params).id)) ? new Response(null, { status: 204 }) : notFound();
  } catch (error) {
    return createApiErrorResponse(error, 'Failed to delete item');
  }
}
