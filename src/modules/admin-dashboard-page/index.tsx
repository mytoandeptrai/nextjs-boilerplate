'use client';

import { FileText, Images, Inbox, Package, Sparkles } from 'lucide-react';

import { useDashboardQuery } from '@/api/admin-dashboard';
import { AdminPageHeader } from '@/components/admin/page-header';
import { QueryState } from '@/components/admin/query-state';
import { QuoteStatusBadge } from '@/components/admin/quote-status-badge';
import { QUOTE_STATUSES } from '@/constants/const';
import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/hooks';
import { Link } from '@/i18n/navigation';
import dayjs from '@/lib/dayjs';
import { formatVnd, toOrderCode } from '@/lib/format';

export default function AdminDashboardPage() {
  const { t } = useTranslations('admin');
  const { data, isLoading, isError, refetch } = useDashboardQuery();

  const stats = data
    ? [
        { label: t('dashboard.newQuotes'), value: data.statusCounts.new, icon: Sparkles, href: ROUTES.ADMIN_QUOTES },
        { label: t('dashboard.totalQuotes'), value: data.totalQuotes, icon: Inbox, href: ROUTES.ADMIN_QUOTES },
        { label: t('dashboard.products'), value: data.products, icon: Package, href: ROUTES.ADMIN_PRODUCTS },
        { label: t('dashboard.lookbooks'), value: data.lookbooks, icon: Images, href: ROUTES.ADMIN_LOOKBOOKS },
        { label: t('dashboard.posts'), value: data.posts, icon: FileText, href: ROUTES.ADMIN_POSTS },
      ]
    : [];

  return (
    <>
      <AdminPageHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />
      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        {data ? (
          <>
            <ul className='grid grid-cols-2 gap-3 lg:grid-cols-5'>
              {stats.map((stat) => (
                <li key={stat.label}>
                  <Link href={stat.href} className='bg-card hover:border-foreground block border p-4 transition-colors'>
                    <stat.icon className='text-brand size-5' strokeWidth={1.5} aria-hidden />
                    <p className='mt-3 text-3xl font-light tabular-nums'>{stat.value}</p>
                    <p className='text-muted-foreground mt-1 text-xs'>{stat.label}</p>
                  </Link>
                </li>
              ))}
            </ul>

            <div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
              <section className='bg-card min-w-0 border'>
                <div className='flex items-center justify-between border-b px-4 py-3'>
                  <h2 className='text-sm font-medium'>{t('dashboard.recentQuotes')}</h2>
                  <Link href={ROUTES.ADMIN_QUOTES} className='text-sm underline underline-offset-4'>
                    {t('dashboard.viewAll')}
                  </Link>
                </div>
                {data.recentQuotes.length > 0 ? (
                  <ul className='divide-y'>
                    {data.recentQuotes.map((quote) => (
                      <li key={quote.id} className='flex items-center justify-between gap-3 px-4 py-3'>
                        <div className='min-w-0'>
                          <p className='truncate text-sm font-medium'>
                            {quote.customer_name}{' '}
                            <span className='text-muted-foreground font-mono text-xs font-normal'>
                              {toOrderCode(quote.id)}
                            </span>
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            {quote.customer_phone} · {dayjs(quote.created_at).format('DD/MM/YYYY HH:mm')}
                          </p>
                        </div>
                        <div className='flex shrink-0 flex-col items-end gap-1'>
                          <span className='text-sm font-medium tabular-nums'>{formatVnd(quote.total_estimate)}</span>
                          <QuoteStatusBadge status={quote.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-muted-foreground px-4 py-10 text-center text-sm'>{t('dashboard.noQuotes')}</p>
                )}
              </section>

              <section className='bg-card border'>
                <h2 className='border-b px-4 py-3 text-sm font-medium'>{t('dashboard.pipeline')}</h2>
                <ul className='divide-y'>
                  {QUOTE_STATUSES.map((status) => (
                    <li key={status} className='flex items-center justify-between px-4 py-2.5'>
                      <QuoteStatusBadge status={status} />
                      <span className='text-sm font-medium tabular-nums'>{data.statusCounts[status]}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </>
        ) : null}
      </QueryState>
    </>
  );
}
