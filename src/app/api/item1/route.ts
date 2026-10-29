import type { NextRequest } from 'next/server';

import { createApiErrorResponse } from '@/utils/api-error';
import { item1Mock } from '@/lib/server/item1-mock';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    return Response.json(
      await item1Mock.find({
        page: Number(searchParams.get('page')) || undefined,
        limit: Number(searchParams.get('limit')) || undefined,
        name: searchParams.get('name') || undefined,
      })
    );
  } catch (error) {
    return createApiErrorResponse(error, 'Failed to fetch items');
  }
}

export async function POST(req: NextRequest) {
  try {
    return Response.json(await item1Mock.create(await req.json()), { status: 201 });
  } catch (error) {
    return createApiErrorResponse(error, 'Failed to create item');
  }
}
