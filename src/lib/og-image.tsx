import { ImageResponse } from 'next/og';

import { LOGO_COLORS } from '@/components/brand/logo';
import { siteConfig } from '@/config/site';
import { OG_IMAGE_SIZE } from '@/constants/const';

interface CreateOgImageOptions {
  title: string;
  description?: string;
}

const BRAND = '#b08d57';

/** The logo mark, as in `LogoMark`. Satori renders plain SVG attributes only, so it is drawn here without classes. */
const Mark = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox='0 0 64 64' aria-hidden>
    <rect width='64' height='64' rx='14' fill={LOGO_COLORS.curtain} />
    <path d='M14 18h17c0 9-4 14-11 16.5 3.5 3.5 5 8.5 5 15.5H14z' fill={LOGO_COLORS.background} />
    <path d='M50 18H33c0 9 4 14 11 16.5-3.5 3.5-5 8.5-5 15.5h11z' fill={LOGO_COLORS.background} />
    <path d='M12 34.5h8M52 34.5h-8' stroke={BRAND} strokeWidth='2.5' strokeLinecap='round' />
    <path d='M11 15.5h42' stroke={BRAND} strokeWidth='3' strokeLinecap='round' />
  </svg>
);

/** Shared renderer for `opengraph-image` and `twitter-image` (1200x630): the logo, the name and one line of copy. */
export const createOgImage = ({ title, description }: CreateOgImageOptions) => {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        background: LOGO_COLORS.background,
        color: LOGO_COLORS.curtain,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <Mark size={112} />
        <div style={{ display: 'flex', fontSize: 30, letterSpacing: 10, color: LOGO_COLORS.rod }}>
          {siteConfig.tagline.toUpperCase()}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -2, lineHeight: 1.1 }}>{title}</div>
        {description ? (
          <div style={{ fontSize: 34, color: '#cbd5e1', lineHeight: 1.4, maxWidth: 960 }}>{description}</div>
        ) : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 28, color: LOGO_COLORS.rod }}>
        <div style={{ display: 'flex', width: 72, height: 3, background: LOGO_COLORS.rod }} />
        {new URL(siteConfig.appUrl).host}
      </div>
    </div>,
    OG_IMAGE_SIZE
  );
};
