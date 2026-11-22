'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  type LookbookBody,
  type LookbookFormInput,
  lookbookSchema,
  useCreateAdminLookbookMutation,
  useUpdateAdminLookbookMutation,
} from '@/api/admin-lookbooks';
import { FieldError } from '@/components/admin/field-error';
import { ImageUpload } from '@/components/admin/image-upload';
import { StoreImage } from '@/components/store/store-image';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from '@/hooks';
import type { ILookbook, IProduct } from '@/types/catalog';

interface ILookbookDialogProps {
  /** `null` creates a new photo. */
  lookbook: ILookbook | null;
  products: IProduct[];
  onClose: () => void;
}

/** Create or edit a lookbook photo and tag the products it shows. Mounted only while open. */
export function LookbookDialog({ lookbook, products, onClose }: ILookbookDialogProps) {
  const { t } = useTranslations('admin');
  const { mutate: create, isPending: isCreating } = useCreateAdminLookbookMutation();
  const { mutate: update, isPending: isUpdating } = useUpdateAdminLookbookMutation();
  const isPending = isCreating || isUpdating;

  const form = useForm<LookbookFormInput, unknown, LookbookBody>({
    resolver: zodResolver(lookbookSchema),
    defaultValues: {
      title: lookbook?.title ?? '',
      description: lookbook?.description ?? '',
      image_url: lookbook?.image_url ?? '',
      // Tags of deleted products are dropped on the next save.
      tagged_product_ids: (lookbook?.tagged_product_ids ?? []).filter((id) => products.some((item) => item.id === id)),
    },
  });

  const _handleSubmit = (body: LookbookBody) => {
    const options = {
      onSuccess: () => {
        toast.success(t('common.saved'));
        onClose();
      },
      onError: () => void toast.error(t('common.saveError')),
    };

    if (lookbook) update({ id: lookbook.id, body }, options);
    else create(body, options);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[100dvh] w-full max-w-xl overflow-y-auto rounded-none sm:max-h-[92dvh]'>
        <DialogHeader>
          <DialogTitle>{lookbook ? t('lookbooks.edit') : t('lookbooks.new')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form noValidate onSubmit={form.handleSubmit(_handleSubmit)} className='flex flex-col gap-4'>
            <FormField
              control={form.control}
              name='image_url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lookbooks.image')}</FormLabel>
                  <ImageUpload
                    folder='lookbooks'
                    value={field.value ? [field.value] : []}
                    onChange={(urls) => field.onChange(urls[0] ?? '')}
                  />
                  <FieldError messageKey='imageRequired' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lookbooks.name')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FieldError />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lookbooks.description')}</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FieldError messageKey='tooLong' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='tagged_product_ids'
              render={({ field }) => (
                <FormItem>
                  <FormLabel asChild>
                    <span>{t('lookbooks.taggedProducts')}</span>
                  </FormLabel>
                  <ul className='max-h-56 divide-y overflow-y-auto border'>
                    {products.map((product) => {
                      const isChecked = field.value.includes(product.id);

                      return (
                        <li key={product.id}>
                          <label
                            htmlFor={`tag-${product.id}`}
                            className='hover:bg-accent flex cursor-pointer items-center gap-3 px-3 py-2'
                          >
                            <Checkbox
                              id={`tag-${product.id}`}
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                field.onChange(
                                  checked ? [...field.value, product.id] : field.value.filter((id) => id !== product.id)
                                )
                              }
                            />
                            <span className='bg-muted relative size-9 shrink-0 overflow-hidden'>
                              <StoreImage src={product.images[0]} alt='' sizes='36px' />
                            </span>
                            <span className='min-w-0 truncate text-sm'>{product.title}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </FormItem>
              )}
            />
            <div className='flex justify-end gap-2 pt-2'>
              <Button type='button' variant='outline' className='rounded-none' onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button type='submit' className='rounded-none' disabled={isPending}>
                {isPending ? <Loader2 className='animate-spin' aria-hidden /> : null}
                {isPending ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
