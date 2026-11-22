'use client';

import { useState } from 'react';

import { StoreImage } from '@/components/store/store-image';
import { useTranslations } from '@/hooks';
import { cn } from '@/lib/utils';

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const { t } = useTranslations('store.product');
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className='flex flex-col gap-3 lg:flex-row-reverse'>
      <div className='bg-muted relative aspect-[4/5] flex-1 overflow-hidden'>
        <StoreImage src={current} alt={title} sizes='(min-width: 1024px) 50vw, 100vw' eager />
      </div>
      {images.length > 1 ? (
        <ul className='flex gap-3 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible'>
          {images.map((image, index) => (
            <li key={image} className='shrink-0'>
              <button
                type='button'
                onClick={() => setActive(index)}
                aria-label={t('photo', { index: index + 1 })}
                aria-current={index === active ? 'true' : undefined}
                className={cn(
                  'bg-muted relative block size-16 overflow-hidden outline-offset-2 transition-opacity lg:size-20',
                  index === active ? 'outline-foreground outline outline-1' : 'opacity-60 hover:opacity-100'
                )}
              >
                <StoreImage src={image} alt='' sizes='80px' />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
