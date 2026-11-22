'use client';

import type { QuoteStatus } from '@/constants/const';
import { useTranslations } from '@/hooks';
import { cn } from '@/lib/utils';

const STYLES: Record<QuoteStatus, string> = {
  new: 'border-amber-300 bg-amber-50 text-amber-800',
  contacted: 'border-sky-300 bg-sky-50 text-sky-800',
  surveyed: 'border-indigo-300 bg-indigo-50 text-indigo-800',
  quoted: 'border-violet-300 bg-violet-50 text-violet-800',
  won: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  lost: 'border-slate-300 bg-slate-100 text-slate-600',
};

export function QuoteStatusBadge({ status, className }: { status: QuoteStatus; className?: string }) {
  const { t } = useTranslations('admin.quotes.status');

  return (
    <span className={cn('inline-flex items-center border px-2 py-0.5 text-xs font-medium', STYLES[status], className)}>
      {t(status)}
    </span>
  );
}
