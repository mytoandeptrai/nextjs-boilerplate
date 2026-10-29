'use client';

import { memo, useDeferredValue, useState } from 'react';

import { Input } from '@/components/ui/input';
import { useTranslations } from '@/hooks';

const WORDS = Array.from({ length: 1500 }, (_, index) => `item-${index + 1}`);

/** Deliberately slow list so the difference between urgent and deferred updates is visible. */
const SlowList = memo(function SlowList({ query }: { query: string }) {
  const matches = WORDS.filter((word) => word.includes(query));

  return (
    <ul className='grid max-h-40 grid-cols-3 gap-1 overflow-auto text-xs'>
      {matches.slice(0, 120).map((word) => {
        const start = performance.now();
        while (performance.now() - start < 0.5) {
          // busy wait: simulates an expensive row
        }

        return <li key={word}>{word}</li>;
      })}
    </ul>
  );
});

export function DeferredDemo() {
  const { t } = useTranslations('react19.deferred');
  const [query, setQuery] = useState('');
  // `useDeferredValue(value)` returns the previous value first and re-renders with the new one in the background,
  // so typing in the input stays responsive while the slow list catches up.
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <div className='flex flex-col gap-3'>
      <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('placeholder')} />
      <div className={isStale ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
        <SlowList query={deferredQuery} />
      </div>
      <p className='text-muted-foreground text-xs'>{isStale ? t('updating') : t('upToDate')}</p>
    </div>
  );
}
