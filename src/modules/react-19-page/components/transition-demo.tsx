'use client';

import { Loader } from 'lucide-react';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks';
import { pingAction } from '../actions';

export function TransitionDemo() {
  const { t } = useTranslations('react19.transition');
  const [lastPing, setLastPing] = useState<string | null>(null);
  // `useTransition` -> [isPending, startTransition]. React 19 lets the transition callback be ASYNC:
  // `isPending` stays true until the awaited work finishes, and the UI stays interactive meanwhile.
  const [isPending, startTransition] = useTransition();

  const ping = () => {
    startTransition(async () => {
      const { at } = await pingAction();
      // State updates after an `await` must be wrapped in their own `startTransition` to stay in the transition.
      startTransition(() => setLastPing(at));
    });
  };

  return (
    <div className='flex items-center gap-3'>
      <Button type='button' onClick={ping} disabled={isPending}>
        {isPending ? <Loader className='mr-2 h-4 w-4 animate-spin' /> : null}
        {isPending ? t('pinging') : t('ping')}
      </Button>
      <p className='text-sm'>
        {lastPing ? t('lastPing', { at: new Date(lastPing).toLocaleTimeString() }) : t('never')}
      </p>
    </div>
  );
}
