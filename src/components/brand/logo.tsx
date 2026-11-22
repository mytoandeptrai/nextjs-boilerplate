import { cn } from '@/lib/utils';

/** Colours of the mark. Kept in step with `public/icon.svg`, the source of the favicons (`pnpm icons:generate`). */
export const LOGO_COLORS = { background: '#1e293b', curtain: '#faf9f6', rod: '#d2b47c' } as const;

/** The logo mark: a pair of tied-back curtains under a rod. Decorative: put the brand name next to it. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 64 64' aria-hidden className={cn('size-9 shrink-0', className)}>
      <rect width='64' height='64' rx='14' fill={LOGO_COLORS.background} />
      <path d='M14 18h17c0 9-4 14-11 16.5 3.5 3.5 5 8.5 5 15.5H14z' fill={LOGO_COLORS.curtain} />
      <path d='M50 18H33c0 9 4 14 11 16.5-3.5 3.5-5 8.5-5 15.5h11z' fill={LOGO_COLORS.curtain} />
      <path d='M12 34.5h8M52 34.5h-8' stroke={LOGO_COLORS.rod} strokeWidth='2.5' strokeLinecap='round' />
      <path d='M11 15.5h42' stroke={LOGO_COLORS.rod} strokeWidth='3' strokeLinecap='round' />
    </svg>
  );
}
