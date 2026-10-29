'use client';

import { createContext, Suspense, use, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from '@/hooks';
import type { IQuote } from '../data';

const SourceContext = createContext('server');

function Quote({ promise }: { promise: Promise<IQuote> }) {
  const { t } = useTranslations('react19.use');
  const [showSource, setShowSource] = useState(false);
  // `use(promise)` suspends until the promise resolves (the nearest <Suspense> shows its fallback).
  // The promise comes from the server: it must be created OUTSIDE this component, never during its render.
  const quote = use(promise);
  // Unlike `useContext`, `use(Context)` may be called conditionally, even after an early return or inside `if`.
  const source = showSource ? use(SourceContext) : null;

  return (
    <div className='flex flex-col gap-2 text-sm'>
      <blockquote className='border-l-2 pl-3 italic'>
        “{quote.text}” <span className='not-italic'>— {quote.author}</span>
      </blockquote>
      <div className='flex items-center gap-3'>
        <Button type='button' variant='outline' size='sm' onClick={() => setShowSource((value) => !value)}>
          {t('toggleSource')}
        </Button>
        {source ? <span className='text-muted-foreground text-xs'>{t('source', { source })}</span> : null}
      </div>
    </div>
  );
}

export function UseDemo({ quotePromise }: { quotePromise: Promise<IQuote> }) {
  return (
    // React 19: a context renders as its own provider, no `.Provider` needed.
    <SourceContext value='Server Component → Promise → use()'>
      <Suspense fallback={<Skeleton className='h-16 w-full' />}>
        <Quote promise={quotePromise} />
      </Suspense>
    </SourceContext>
  );
}
