import { ImageResponse } from 'next/og';

import { siteConfig } from '@/config/site';
import { OG_IMAGE_SIZE } from '@/constants/const';

interface CreateOgImageOptions {
  title: string;
  description?: string;
}

/** Shared renderer for `opengraph-image` and `twitter-image` (1200x630). */
export const createOgImage = ({ title, description }: CreateOgImageOptions) => {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 24,
        padding: 80,
        background: '#0a0a0a',
        color: '#fafafa',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: 16,
            background: '#fafafa',
            color: '#0a0a0a',
            fontSize: 44,
            fontWeight: 700,
          }}
        >
          {siteConfig.name.charAt(0)}
        </div>
      </div>
      <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2, lineHeight: 1.1 }}>{title}</div>
      {description ? (
        <div style={{ fontSize: 32, color: '#a3a3a3', lineHeight: 1.4, maxWidth: 900 }}>{description}</div>
      ) : null}
    </div>,
    OG_IMAGE_SIZE
  );
};
