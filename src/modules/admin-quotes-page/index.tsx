'use client';

import { Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useDeleteQuoteMutation, useQuotesQuery, useUpdateQuoteStatusMutation } from '@/api/admin-quotes';
import { AdminPageHeader } from '@/components/admin/page-header';
import { QueryState } from '@/components/admin/query-state';
import { QuoteStatusBadge } from '@/components/admin/quote-status-badge';
import ConfirmationDialog from '@/components/common/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { QUOTE_STATUSES, type QuoteStatus } from '@/constants/const';
import { useTranslations } from '@/hooks';
import dayjs from '@/lib/dayjs';
import { formatVnd, toOrderCode } from '@/lib/format';
import { cn } from '@/lib/utils';
import { QuoteDetail } from './quote-detail';

const PAGE_SIZE = 10;

export default function AdminQuotesPage() {
  const { t } = useTranslations('admin');
  const [status, setStatus] = useState<QuoteStatus | undefined>();
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useQuotesQuery({ status, page, pageSize: PAGE_SIZE });
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateQuoteStatusMutation();
  const { mutate: deleteQuote } = useDeleteQuoteMutation();

  const quotes = data?.items ?? [];
  const totalPages = data?.meta.total_pages ?? 1;
  const allCount = data ? Object.values(data.statusCounts).reduce((sum, value) => sum + value, 0) : undefined;
  const tabs: { value: QuoteStatus | undefined; label: string; count?: number }[] = [
    { value: undefined, label: t('quotes.all'), count: allCount },
    ...QUOTE_STATUSES.map((value) => ({
      value,
      label: t(`quotes.status.${value}`),
      count: data?.statusCounts[value],
    })),
  ];

  const _handleFilter = (value: QuoteStatus | undefined) => {
    setStatus(value);
    setPage(1);
  };

  const _handleStatus = (id: string, value: QuoteStatus) =>
    updateStatus(
      { id, status: value },
      {
        onSuccess: () => toast.success(t('quotes.statusUpdated')),
        onError: () => toast.error(t('common.saveError')),
      }
    );

  const _handleDelete = (id: string) =>
    deleteQuote(id, {
      onSuccess: () => toast.success(t('common.deleted')),
      onError: () => toast.error(t('common.deleteError')),
    });

  return (
    <>
      <AdminPageHeader title={t('quotes.title')} subtitle={t('quotes.subtitle')} />

      <div className='-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0'>
        <div role='tablist' aria-label={t('quotes.statusLabel')} className='flex w-max gap-2'>
          {tabs.map((tab) => (
            <button
              key={tab.value ?? 'all'}
              type='button'
              role='tab'
              aria-selected={tab.value === status}
              onClick={() => _handleFilter(tab.value)}
              className={cn(
                'flex items-center gap-2 border px-3 py-1.5 text-sm transition-colors',
                tab.value === status
                  ? 'border-foreground bg-foreground text-background'
                  : 'bg-card hover:border-foreground'
              )}
            >
              {tab.label}
              {tab.count === undefined ? null : <span className='text-xs tabular-nums opacity-70'>{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isEmpty={quotes.length === 0}
        emptyText={t('quotes.empty')}
      >
        <div className='bg-card overflow-x-auto border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('quotes.code')}</TableHead>
                <TableHead>{t('quotes.customer')}</TableHead>
                <TableHead className='text-right'>{t('quotes.total')}</TableHead>
                <TableHead>{t('quotes.channel')}</TableHead>
                <TableHead>{t('quotes.statusLabel')}</TableHead>
                <TableHead>{t('quotes.createdAt')}</TableHead>
                <TableHead className='text-right'>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className='font-mono text-xs'>{toOrderCode(quote.id)}</TableCell>
                  <TableCell>
                    <p className='font-medium'>{quote.customer_name}</p>
                    <a href={`tel:${quote.customer_phone}`} className='text-muted-foreground text-xs hover:underline'>
                      {quote.customer_phone}
                    </a>
                  </TableCell>
                  <TableCell className='text-right font-medium tabular-nums'>
                    {formatVnd(quote.total_estimate)}
                  </TableCell>
                  <TableCell>
                    <span className='border px-2 py-0.5 text-xs'>{t(`quotes.channels.${quote.channel}`)}</span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={quote.status}
                      disabled={isUpdating}
                      onValueChange={(value) => _handleStatus(quote.id, value as QuoteStatus)}
                    >
                      <SelectTrigger
                        aria-label={t('quotes.statusLabel')}
                        className='hover:border-input h-8 w-[150px] rounded-none border-transparent bg-transparent px-1 shadow-none'
                      >
                        <SelectValue>
                          <QuoteStatusBadge status={quote.status} />
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {QUOTE_STATUSES.map((value) => (
                          <SelectItem key={value} value={value}>
                            {t(`quotes.status.${value}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className='text-muted-foreground text-xs whitespace-nowrap'>
                    {dayjs(quote.created_at).format('DD/MM/YYYY HH:mm')}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        aria-label={t('quotes.view')}
                        data-testid='quote-view'
                        onClick={() => setDetailId(quote.id)}
                      >
                        <Eye aria-hidden />
                      </Button>
                      <ConfirmationDialog
                        title={t('common.delete')}
                        description={t('common.deleteConfirm', { name: toOrderCode(quote.id) })}
                        confirmText={t('common.delete')}
                        onConfirm={() => _handleDelete(quote.id)}
                      >
                        <Button variant='ghost' size='icon' aria-label={t('common.delete')}>
                          <Trash2 aria-hidden />
                        </Button>
                      </ConfirmationDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 ? (
          <div className='flex items-center justify-end gap-3 text-sm'>
            <span className='text-muted-foreground'>{t('common.page', { page, total: totalPages })}</span>
            <Button variant='outline' size='sm' disabled={page <= 1} onClick={() => setPage(page - 1)}>
              {t('common.previous')}
            </Button>
            <Button variant='outline' size='sm' disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              {t('common.next')}
            </Button>
          </div>
        ) : null}
      </QueryState>

      <QuoteDetail quote={quotes.find((quote) => quote.id === detailId) ?? null} onClose={() => setDetailId(null)} />
    </>
  );
}
