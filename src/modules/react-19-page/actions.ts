'use server';

import { z } from 'zod';

import { MAX_NAME_LENGTH } from './const';

export type GreetingErrorKey = 'nameRequired' | 'nameTooLong';

export interface IGreetingState {
  status: 'idle' | 'success' | 'error';
  name?: string;
  errorKey?: GreetingErrorKey;
}

export interface INote {
  id: string;
  text: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Server Action used with `useActionState`: `(previousState, formData) => newState`.
 * Errors are returned as keys, never thrown, so the client can translate them.
 */
export async function greetAction(_previous: IGreetingState, formData: FormData): Promise<IGreetingState> {
  await delay(600);

  const parsed = z
    .string()
    .trim()
    .min(1)
    .max(MAX_NAME_LENGTH)
    .safeParse(formData.get('name') ?? '');

  if (parsed.success) return { status: 'success', name: parsed.data };

  const tooLong = parsed.error.issues.some((issue) => issue.code === 'too_big');

  return { status: 'error', errorKey: tooLong ? 'nameTooLong' : 'nameRequired' };
}

/** Slow on purpose so the optimistic UI is visible. Texts containing "fail" are rejected to show the rollback. */
export async function addNoteAction(text: string): Promise<INote> {
  await delay(1200);

  if (/fail/i.test(text)) throw new Error('Note rejected');

  return { id: crypto.randomUUID(), text };
}

/** Called inside an async transition (`useTransition`). */
export async function pingAction(): Promise<{ at: string }> {
  await delay(800);

  return { at: new Date().toISOString() };
}
