'use client';

import { useOptimistic, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { useTranslations } from '@/hooks';
import { addNoteAction, type INote } from '../actions';
import { SubmitButton } from './submit-button';

interface IOptimisticNote extends INote {
  pending?: boolean;
}

export function OptimisticDemo() {
  const { t } = useTranslations('react19.optimistic');
  const formRef = useRef<HTMLFormElement>(null);
  const [notes, setNotes] = useState<INote[]>([]);
  // `useOptimistic(state, reducer)` shows `state` plus a temporary change while an async action is running.
  // When the action settles, React drops the optimistic value and renders the real `state` again,
  // so a failed action rolls back by itself.
  const [optimisticNotes, addOptimisticNote] = useOptimistic<IOptimisticNote[], string>(notes, (current, text) => [
    ...current,
    { id: `optimistic-${current.length}`, text, pending: true },
  ]);

  const addNote = async (formData: FormData) => {
    const text = String(formData.get('text') ?? '').trim();

    if (!text) return;

    formRef.current?.reset();
    addOptimisticNote(text);

    try {
      const saved = await addNoteAction(text);
      setNotes((current) => [...current, saved]);
    } catch {
      toast.error(t('failed'));
    }
  };

  return (
    <div className='flex flex-col gap-3'>
      <form ref={formRef} action={addNote} className='flex gap-2'>
        <Input name='text' placeholder={t('placeholder')} aria-label={t('label')} />
        <SubmitButton pendingLabel={t('saving')}>{t('add')}</SubmitButton>
      </form>
      <p className='text-muted-foreground text-xs'>{t('hint')}</p>
      <ul className='flex flex-col gap-1 text-sm'>
        {optimisticNotes.map((note) => (
          <li key={note.id} className={note.pending ? 'opacity-50' : undefined}>
            {note.text}
            {note.pending ? <span className='ml-2 text-xs'>{t('pending')}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
