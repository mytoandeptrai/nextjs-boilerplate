'use client';

import Image from 'next/image';
import { useState } from 'react';

import { FALLBACK_IMAGE } from '@/constants/const';
import { getStoragePublicPrefix } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface IStoreImageProps {
  src: string | null | undefined;
  alt: string;
  /** Required by `fill` images so the browser picks the right width. */
  sizes: string;
  className?: string;
  /** Above-the-fold image (hero, first gallery photo): load it at once and with high priority. */
  eager?: boolean;
}

/**
 * Catalogue image that fills its (relative, sized) parent. Bucket images go through the Next.js optimizer; any other
 * URL is served as is, because only the bucket is allowed in `images.remotePatterns`. A missing or broken image
 * becomes the neutral placeholder instead of a broken icon.
 */
export function StoreImage({ src, alt, sizes, className, eager = false }: IStoreImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const prefix = getStoragePublicPrefix();
  const source = src && src !== failedSrc ? src : FALLBACK_IMAGE;
  const isOptimizable = source.startsWith('/') || Boolean(prefix && source.startsWith(prefix));

  return (
    <Image
      src={source}
      alt={alt}
      fill
      sizes={sizes}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      unoptimized={!isOptimizable}
      draggable={false}
      onError={() => setFailedSrc(src ?? null)}
      className={cn('object-cover', className)}
    />
  );
}
