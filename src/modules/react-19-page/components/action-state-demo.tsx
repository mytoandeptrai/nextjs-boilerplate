'use client';

import { useActionState } from 'react';

import { Input } from '@/components/ui/input';
import { useTranslations } from '@/hooks';
import { greetAction, type IGreetingState } from '../actions';
import { MAX_NAME_LENGTH } from '../const';
import { SubmitButton } from './submit-button';

const initialState: IGreetingState = { status: 'idle' };

export function ActionStateDemo() {
  const { t } = useTranslations('react19.actionState');
  // `useActionState(action, initialState)` -> [state, formAction, isPending].
  // React calls `greetAction(previousState, formData)` on submit and stores what it returns as the new state.
  const [state, formAction, isPending] = useActionState(greetAction, initialState);

  return (
    <form action={formAction} className='flex flex-col gap-3'>
      <Input
        name='name'
        placeholder={t('placeholder')}
        aria-label={t('label')}
        aria-invalid={state.status === 'error'}
        disabled={isPending}
      />
      <div className='flex items-center gap-3'>
        <SubmitButton pendingLabel={t('submitting')}>{t('submit')}</SubmitButton>
        <p aria-live='polite' className='text-sm'>
          {state.status === 'success' ? t('greeting', { name: state.name ?? '' }) : null}
          {state.status === 'error' && state.errorKey ? (
            <span className='text-destructive'>{t(state.errorKey, { max: MAX_NAME_LENGTH })}</span>
          ) : null}
        </p>
      </div>
    </form>
  );
}
