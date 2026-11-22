import 'server-only';

import { env } from '@/constants/env';
import { HttpStatus } from '@/enums/enum';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getStoragePublicPrefix } from '@/lib/supabase/client';
import type { UploadFolder } from '@/constants/const';

const SIGNATURES: { mime: string; ext: string; test: (bytes: Uint8Array) => boolean }[] = [
  { mime: 'image/jpeg', ext: 'jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/png', ext: 'png', test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { mime: 'image/webp', ext: 'webp', test: (b) => ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WEBP' },
  { mime: 'image/avif', ext: 'avif', test: (b) => ascii(b, 4, 8) === 'ftyp' && /^avi[fs]$/.test(ascii(b, 8, 12)) },
];

const ascii = (bytes: Uint8Array, start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));

/** Decide the image type from the file's first bytes, never from its name or the `Content-Type` the client sent. */
export const sniffImageType = (bytes: Uint8Array): { mime: string; ext: string } | null => {
  const match = SIGNATURES.find((signature) => bytes.length >= 12 && signature.test(bytes));

  return match ? { mime: match.mime, ext: match.ext } : null;
};

const bucket = () => {
  if (!env.SUPABASE_STORAGE_BUCKET)
    throw { status: HttpStatus.SERVICE_UNAVAILABLE, message: 'Storage bucket is not configured' };

  return getSupabaseAdmin().storage.from(env.SUPABASE_STORAGE_BUCKET);
};

/** Store an image under `{folder}/{yyyy}/{mm}/{uuid}.{ext}` and return its public URL. */
export const uploadImage = async (folder: UploadFolder, bytes: Uint8Array): Promise<{ url: string; path: string }> => {
  const type = sniffImageType(bytes);

  if (!type) throw { status: HttpStatus.UNSUPPORTED_MEDIA_TYPE, message: 'Only JPEG, PNG, WebP and AVIF are allowed' };

  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const path = `${folder}/${now.getUTCFullYear()}/${month}/${crypto.randomUUID()}.${type.ext}`;
  // Object names are random, so the file never changes: cache it for a year.
  const { error } = await bucket().upload(path, bytes, {
    contentType: type.mime,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) {
    console.error('[storage] upload failed', error.message);
    throw { status: HttpStatus.BAD_GATEWAY, message: 'Upload failed' };
  }

  return { url: bucket().getPublicUrl(path).data.publicUrl, path };
};

/**
 * Delete the objects behind public URLs that a row no longer references. Best effort: URLs outside this bucket are
 * ignored and a failure is logged, never thrown.
 */
export const removeImages = async (urls: (string | null | undefined)[]): Promise<void> => {
  const prefix = getStoragePublicPrefix();
  const paths = urls
    .filter((url): url is string => Boolean(url && prefix && url.startsWith(prefix)))
    .map((url) => decodeURIComponent(url.slice(prefix!.length).split('?')[0]));

  if (!paths.length) return;

  try {
    const { error } = await bucket().remove(paths);

    if (error) console.error('[storage] cleanup failed', error.message);
  } catch (error) {
    console.error('[storage] cleanup failed', error);
  }
};
