'use client';

import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from '@/hooks';

interface IQueryStateProps {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  /** Shown instead of the children when there is nothing to list. */
  isEmpty?: boolean;
  emptyText?: string;
  children: ReactNode;
}

/** Loading, error (with retry) and empty states shared by every admin list. */
export function QueryState({ isLoading, isError, onRetry, isEmpty, emptyText, children }: IQueryStateProps) {
  const { t } = useTranslations('admin.common');

  if (isLoading)
    return (
      <div className='space-y-3' aria-busy>
        <Skeleton className='h-12 w-full' />
        <Skeleton className='h-12 w-full' />
        <Skeleton className='h-12 w-full' />
      </div>
    );

  if (isError)
    return (
      <div
        role='alert'
        className='bg-card flex flex-col items-center gap-3 border border-dashed px-6 py-12 text-center'
      >
        <p className='text-muted-foreground text-sm'>{t('loadError')}</p>
        <Button variant='outline' onClick={onRetry}>
          {t('retry')}
        </Button>
      </div>
    );

  if (isEmpty)
    return (
      <p className='bg-card text-muted-foreground border border-dashed px-6 py-16 text-center text-sm'>{emptyText}</p>
    );

  return children;
}
