'use client';

import { useTranslations } from '@/hooks';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslations('common');

  return (
    <div>
      <h2>{t('error.title')}</h2>
      <button type='button' onClick={() => reset()}>
        {t('error.retry')}
      </button>
    </div>
  );
}
