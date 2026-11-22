'use client';

import { useFormField } from '@/components/ui/form';
import { useTranslations } from '@/hooks';
import type { TranslationKey } from '@/types/translation';

/**
 * Translated error of the surrounding `FormField`. The admin schemas are shared with the Route Handlers and carry
 * no messages, so the form says which rule applies; a server-side `taken` error (duplicate slug) has its own text.
 */
export function FieldError({ messageKey = 'required' }: { messageKey?: TranslationKey<'validation'> }) {
  const { error, formMessageId } = useFormField();
  const { t } = useTranslations('validation');

  if (!error) return null;

  return (
    <p id={formMessageId} role='alert' className='text-destructive text-sm'>
      {t(error.type === 'taken' ? 'slugTaken' : messageKey)}
    </p>
  );
}
