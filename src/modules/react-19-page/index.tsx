import { useTranslationsServer } from '@/hooks/use-translations-server';
import { ActionStateDemo } from './components/action-state-demo';
import { DeferredDemo } from './components/deferred-demo';
import { DemoSection } from './components/demo-section';
import { OptimisticDemo } from './components/optimistic-demo';
import { TransitionDemo } from './components/transition-demo';
import { UseDemo } from './components/use-demo';
import { getQuote } from './data';

export default async function React19Page() {
  const { t } = await useTranslationsServer('react19');
  // Not awaited on purpose: the pending promise is streamed to the client and read there with `use()`.
  const quotePromise = getQuote();

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <h1 className='text-2xl font-bold'>{t('title')}</h1>
        <p className='text-muted-foreground text-sm'>{t('subtitle')}</p>
      </div>
      <div className='grid gap-4 lg:grid-cols-2'>
        <DemoSection
          title={t('actionState.title')}
          description={t('actionState.description')}
          hooks={['useActionState', 'useFormStatus']}
        >
          <ActionStateDemo />
        </DemoSection>
        <DemoSection title={t('optimistic.title')} description={t('optimistic.description')} hooks={['useOptimistic']}>
          <OptimisticDemo />
        </DemoSection>
        <DemoSection title={t('use.title')} description={t('use.description')} hooks={['use']}>
          <UseDemo quotePromise={quotePromise} />
        </DemoSection>
        <DemoSection title={t('transition.title')} description={t('transition.description')} hooks={['useTransition']}>
          <TransitionDemo />
        </DemoSection>
        <DemoSection title={t('deferred.title')} description={t('deferred.description')} hooks={['useDeferredValue']}>
          <DeferredDemo />
        </DemoSection>
      </div>
    </div>
  );
}
