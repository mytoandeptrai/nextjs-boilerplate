import type { NextRequest } from 'next/server';

import { MEDIA_KEYS } from '@/api/media/keys';
import { buildRoute } from '@/constants/routes';
import { backendRequest } from '@/lib/server/backend';
import { createApiErrorResponse } from '@/utils/api-error';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data } = await backendRequest({ method: 'GET', url: buildRoute(MEDIA_KEYS.MEDIA_DETAIL, { id }) });

    return Response.json(data);
  } catch (error) {
    return createApiErrorResponse(error, 'Failed to fetch media');
  }
}
