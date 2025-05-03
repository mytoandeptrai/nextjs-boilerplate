'use client';

import type { ImageProps } from 'next/image';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#500e10" offset="20%" />
      <stop stop-color="#5a0a0c" offset="50%" />
      <stop stop-color="#500e10" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#5a0a0c" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

export const ImageLoader = ({ alt, ...props }: ImageProps) => {
  const [src, setSrc] = useState(props.src || '/images/image_unavailable.webp');

  useEffect(() => {
    setSrc(props.src || '/images/image_unavailable.webp');
  }, [props.src]);

  if (!src) return null;

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      unoptimized
      key={src?.toString()}
      draggable={false}
      onError={() => setSrc('/images/image_unavailable.webp')}
      placeholder='blur'
      blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(500, 500))}`}
    />
  );
};
