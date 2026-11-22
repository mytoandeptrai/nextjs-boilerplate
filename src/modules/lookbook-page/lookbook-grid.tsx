'use client';

import { useState } from 'react';

import { StoreImage } from '@/components/store/store-image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { buildRoute, ROUTES } from '@/constants/routes';
import { useTranslations } from '@/hooks';
import { Link } from '@/i18n/navigation';
import type { ILookbook } from '@/types/catalog';

export interface ILookbookEntry extends ILookbook {
  /** Tagged products that are still active. */
  products: { id: string; slug: string; title: string; image: string | null }[];
}

/** Tile shapes repeat in this order, which gives the columns their staggered look. */
const ASPECTS = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]'];

/** Masonry gallery; a photo opens larger with the products it features. */
export function LookbookGrid({ entries }: { entries: ILookbookEntry[] }) {
  const { t } = useTranslations('store.lookbook');
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = entries.find((entry) => entry.id === activeId) ?? null;

  return (
    <>
      <ul className='mt-10 columns-2 gap-3 lg:columns-3 lg:gap-4'>
        {entries.map((entry, index) => (
          <li key={entry.id} className='mb-3 break-inside-avoid lg:mb-4'>
            <button
              type='button'
              onClick={() => setActiveId(entry.id)}
              aria-label={t('viewPhoto', { title: entry.title })}
              className={`group bg-muted relative block w-full overflow-hidden text-left ${ASPECTS[index % ASPECTS.length]}`}
            >
              <StoreImage
                src={entry.image_url}
                alt={entry.title}
                sizes='(min-width: 1024px) 33vw, 50vw'
                eager={index < 2}
                className='transition-transform duration-700 ease-out group-hover:scale-105'
              />
              <span className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent p-4 pt-12 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'>
                {entry.title}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActiveId(null)}>
        <DialogContent className='max-h-[100dvh] w-full max-w-4xl overflow-y-auto rounded-none p-0 sm:max-h-[92dvh]'>
          {active ? (
            <div className='grid md:grid-cols-[1.4fr_1fr]'>
              <div className='bg-muted relative aspect-[4/5] md:aspect-auto md:min-h-[560px]'>
                <StoreImage src={active.image_url} alt={active.title} sizes='(min-width: 768px) 55vw, 100vw' />
              </div>
              <div className='p-6 md:p-8'>
                <DialogHeader>
                  <DialogTitle className='pr-6 text-2xl leading-snug font-light'>{active.title}</DialogTitle>
                  <DialogDescription className='leading-6'>{active.description}</DialogDescription>
                </DialogHeader>
                {active.products.length > 0 ? (
                  <div className='border-border mt-6 border-t pt-6'>
                    <p className='eyebrow mb-4'>{t('taggedProducts')}</p>
                    <ul className='space-y-3'>
                      {active.products.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={buildRoute(ROUTES.PRODUCT_DETAIL, { slug: product.slug })}
                            className='group flex items-center gap-3'
                          >
                            <span className='bg-muted relative size-14 shrink-0 overflow-hidden'>
                              <StoreImage src={product.image} alt='' sizes='56px' />
                            </span>
                            <span className='group-hover:text-brand text-sm font-medium'>{product.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
