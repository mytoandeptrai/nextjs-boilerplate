'use client';

import { ImagePlus, Loader2, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useUploadImageMutation } from '@/api/uploads';
import { StoreImage } from '@/components/store/store-image';
import { UPLOAD_MAX_BYTES, type UploadFolder } from '@/constants/const';
import { useTranslations } from '@/hooks';
import { resizeImage } from '@/lib/image-resize';
import { cn } from '@/lib/utils';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

interface IImageUploadProps {
  folder: UploadFolder;
  /** Current image URLs, in display order. */
  value: string[];
  onChange: (value: string[]) => void;
  /** 1 = single image field. */
  max?: number;
  className?: string;
}

/**
 * Image field for the admin forms: pick one or more photos, they are downscaled in the browser and stored in the
 * Supabase bucket through `POST /api/admin/uploads`. The form only keeps the public URLs.
 */
export function ImageUpload({ folder, value, onChange, max = 1, className }: IImageUploadProps) {
  const { t } = useTranslations('admin.common');
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync } = useUploadImageMutation();
  const [pending, setPending] = useState(0);
  const isSingle = max === 1;

  const _handleFiles = async (files: FileList | null) => {
    const picked = Array.from(files ?? []).slice(0, isSingle ? 1 : Math.max(0, max - value.length));

    if (inputRef.current) inputRef.current.value = '';
    if (!picked.length) return;

    setPending(picked.length);

    const uploaded: string[] = [];

    for (const file of picked) {
      try {
        if (!ACCEPTED_TYPES.includes(file.type)) throw new Error(t('uploadInvalidType'));

        const blob = await resizeImage(file);

        if (blob.size > UPLOAD_MAX_BYTES) throw new Error(t('uploadTooLarge'));

        uploaded.push((await mutateAsync({ file: blob, folder })).url);
      } catch (error) {
        const reason = error instanceof Error ? error.message : (error as { message?: string })?.message;

        toast.error(`${t('uploadError')}: ${file.name}`, { description: reason });
      } finally {
        setPending((count) => count - 1);
      }
    }

    if (uploaded.length) onChange(isSingle ? uploaded : [...value, ...uploaded]);
  };

  const canAdd = value.length < max;

  return (
    <div className={className}>
      <ul className={cn('grid gap-3', isSingle ? 'grid-cols-1' : 'grid-cols-[repeat(auto-fill,minmax(88px,1fr))]')}>
        {value.map((url, index) => (
          <li
            key={url}
            className={cn(
              'group bg-muted relative overflow-hidden border',
              isSingle ? 'aspect-[3/2]' : 'aspect-square'
            )}
          >
            <StoreImage src={url} alt='' sizes={isSingle ? '480px' : '160px'} />
            {!isSingle && index === 0 ? (
              <span className='bg-foreground text-background absolute bottom-0 left-0 px-2 py-0.5 text-[10px] tracking-wider uppercase'>
                {t('cover')}
              </span>
            ) : null}
            <button
              type='button'
              onClick={() => onChange(value.filter((item) => item !== url))}
              aria-label={t('removeImage')}
              className='bg-background/90 text-foreground hover:bg-destructive absolute top-1 right-1 flex size-7 items-center justify-center shadow-sm hover:text-white'
            >
              <X className='size-4' aria-hidden />
            </button>
          </li>
        ))}
        {canAdd ? (
          <li className={isSingle ? 'aspect-[3/2]' : 'aspect-square'}>
            <label
              htmlFor={inputId}
              className={cn(
                'bg-card text-muted-foreground hover:border-foreground hover:text-foreground flex size-full cursor-pointer flex-col items-center justify-center gap-2 border border-dashed p-2 text-center text-xs transition-colors',
                pending > 0 && 'pointer-events-none opacity-60'
              )}
            >
              {pending > 0 ? (
                <Loader2 className='size-5 animate-spin' aria-hidden />
              ) : (
                <ImagePlus className='size-5' aria-hidden />
              )}
              {pending > 0 ? t('uploading') : t('upload')}
            </label>
          </li>
        ) : null}
      </ul>
      {isSingle && value.length > 0 ? (
        <label htmlFor={inputId} className='mt-2 inline-block cursor-pointer text-sm underline underline-offset-4'>
          {pending > 0 ? t('uploading') : t('upload')}
        </label>
      ) : null}
      <input
        ref={inputRef}
        id={inputId}
        type='file'
        accept={ACCEPTED_TYPES.join(',')}
        multiple={!isSingle}
        className='sr-only'
        onChange={(event) => _handleFiles(event.target.files)}
        data-testid='image-upload-input'
      />
      <p className='text-muted-foreground mt-2 text-xs'>{t('uploadHint')}</p>
    </div>
  );
}
