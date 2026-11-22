import 'server-only';

import type { z } from 'zod';

import { HttpStatus } from '@/enums/enum';

/** Route Handler context for `[id]` routes (params are a promise in Next.js 16). */
export interface IIdContext {
  params: Promise<{ id: string }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getId = async ({ params }: IIdContext): Promise<string> => {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) throw { status: HttpStatus.NOT_FOUND, message: 'Not found' };

  return id;
};

/** Parse a JSON body with a Zod schema or throw a 400 naming the first invalid field. */
export const parseBody = async <Schema extends z.ZodType>(req: Request, schema: Schema): Promise<z.output<Schema>> => {
  const parsed = schema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    const issue = parsed.error.issues[0];

    throw { status: HttpStatus.BAD_REQUEST, message: `${issue?.path.join('.') || 'body'}: ${issue?.message}` };
  }

  return parsed.data;
};
