import type { NextRequest } from 'next/server';

import { MEDIA_KEYS } from '@/api/media/keys';
import { backendRequest } from '@/lib/server/backend';
import { createApiErrorResponse } from '@/utils/api-error';

export async function GET(req: NextRequest) {
  try {
    const { data } = await backendRequest({
      method: 'GET',
      url: MEDIA_KEYS.MEDIA,
      params: Object.fromEntries(req.nextUrl.searchParams),
    });

    return Response.json(data);
  } catch (error) {
    return createApiErrorResponse(error, 'Failed to fetch media');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { data, status } = await backendRequest({ method: 'POST', url: MEDIA_KEYS.MEDIA, data: await req.json() });

    return Response.json(data, { status });
  } catch (error) {
    return createApiErrorResponse(error, 'Failed to create media');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { data } = await backendRequest({ method: 'DELETE', url: MEDIA_KEYS.MEDIA, data: await req.json() });

    return Response.json(data);
  } catch (error) {
    return createApiErrorResponse(error, 'Failed to delete media');
  }
}
