'use client';

import { MessageCircle, Phone } from 'lucide-react';

import { StoreImage } from '@/components/store/store-image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useTranslations } from '@/hooks';
import dayjs from '@/lib/dayjs';
import { formatVnd, toOrderCode } from '@/lib/format';
import { buildZaloUrl } from '@/lib/zalo';
import type { IQuoteRequest } from '@/types/catalog';

/** Read-only details of a lead: who asked, how to reach them and exactly what they configured. */
export function QuoteDetail({ quote, onClose }: { quote: IQuoteRequest | null; onClose: () => void }) {
  const { t } = useTranslations();
  const zaloUrl = quote ? buildZaloUrl(quote.customer_phone) : null;

  return (
    <Sheet open={Boolean(quote)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className='w-full gap-0 overflow-y-auto sm:max-w-lg'>
        {quote ? (
          <>
            <SheetHeader className='border-b px-6 py-5'>
              <SheetTitle className='text-xl font-light'>
                {t('admin.quotes.detail.title')} <span className='font-mono text-base'>{toOrderCode(quote.id)}</span>
              </SheetTitle>
              <SheetDescription>{dayjs(quote.created_at).format('DD/MM/YYYY HH:mm')}</SheetDescription>
            </SheetHeader>

            <div className='space-y-6 px-6 py-5'>
              <dl className='grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 text-sm'>
                <dt className='text-muted-foreground'>{t('admin.quotes.customer')}</dt>
                <dd className='font-medium'>{quote.customer_name}</dd>
                <dt className='text-muted-foreground'>{t('admin.quotes.detail.phone')}</dt>
                <dd>{quote.customer_phone}</dd>
                <dt className='text-muted-foreground'>{t('admin.quotes.detail.address')}</dt>
                <dd>{quote.customer_address || '—'}</dd>
                <dt className='text-muted-foreground'>{t('admin.quotes.detail.notes')}</dt>
                <dd className='whitespace-pre-line'>{quote.notes || '—'}</dd>
              </dl>

              <div className='flex gap-2'>
                <Button asChild variant='outline' className='flex-1 rounded-none'>
                  <a href={`tel:${quote.customer_phone}`}>
                    <Phone aria-hidden />
                    {t('admin.quotes.detail.call')}
                  </a>
                </Button>
                {zaloUrl ? (
                  <Button asChild variant='outline' className='flex-1 rounded-none'>
                    <a href={zaloUrl} target='_blank' rel='noopener noreferrer'>
                      <MessageCircle aria-hidden />
                      {t('admin.quotes.detail.zalo')}
                    </a>
                  </Button>
                ) : null}
              </div>

              <section>
                <h3 className='mb-2 text-sm font-medium'>{t('admin.quotes.detail.items')}</h3>
                <ul className='divide-y border-y'>
                  {quote.cart_items.map((line, index) => (
                    <li key={index} className='flex gap-3 py-3'>
                      <span className='bg-muted relative size-14 shrink-0 overflow-hidden'>
                        <StoreImage src={line.image} alt='' sizes='56px' />
                      </span>
                      <div className='min-w-0 flex-1 text-sm'>
                        <p className='font-medium'>
                          {line.title} <span className='text-muted-foreground'>×{line.quantity}</span>
                        </p>
                        <p className='text-muted-foreground text-xs leading-5'>
                          {[
                            `${t('store.cart.width')} ${line.width_cm}cm × ${t('store.cart.height')} ${line.height_cm}cm`,
                            line.pleat?.label,
                            line.fullness ? `${t('store.cart.fullness')} ${line.fullness}x` : null,
                            line.fabric?.label,
                            line.motor?.label ?? t('store.configurator.noMotor'),
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                      <span className='shrink-0 text-sm font-medium tabular-nums'>{formatVnd(line.line_total)}</span>
                    </li>
                  ))}
                </ul>
                <p className='mt-3 flex items-baseline justify-between'>
                  <span className='text-sm'>{t('store.cart.total')}</span>
                  <span className='text-xl font-medium tabular-nums'>{formatVnd(quote.total_estimate)}</span>
                </p>
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
