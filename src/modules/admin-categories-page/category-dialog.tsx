'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import {
  type CategoryBody,
  type CategoryFormInput,
  categorySchema,
  useCreateAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
} from '@/api/admin-categories';
import { FieldError } from '@/components/admin/field-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { HttpStatus } from '@/enums/enum';
import { useTranslations } from '@/hooks';
import { slugify } from '@/lib/format';
import type { ICategory } from '@/types/catalog';

interface ICategoryDialogProps {
  /** `null` creates a new category. */
  category: ICategory | null;
  /** Order suggested for a new category: after the last one. */
  nextOrder: number;
  onClose: () => void;
}

/** Create or edit a category. Mounted only while open. */
export function CategoryDialog({ category, nextOrder, onClose }: ICategoryDialogProps) {
  const { t } = useTranslations('admin');
  const { mutate: create, isPending: isCreating } = useCreateAdminCategoryMutation();
  const { mutate: update, isPending: isUpdating } = useUpdateAdminCategoryMutation();
  const isPending = isCreating || isUpdating;

  const form = useForm<CategoryFormInput, unknown, CategoryBody>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      title: category?.title ?? '',
      slug: category?.slug ?? '',
      display_order: category?.display_order ?? nextOrder,
    },
  });
  const slug = useWatch({ control: form.control, name: 'slug' });

  const _handleSubmit = (body: CategoryBody) => {
    const options = {
      onSuccess: () => {
        toast.success(t('common.saved'));
        onClose();
      },
      onError: (error: { status: number }) => {
        if (error.status === HttpStatus.CONFLICT)
          return form.setError('slug', { type: 'taken' }, { shouldFocus: true });

        toast.error(t('common.saveError'));
      },
    };

    if (category) update({ id: category.id, body }, options);
    else create(body, options);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[100dvh] w-full max-w-md overflow-y-auto rounded-none sm:max-h-[92dvh]'>
        <DialogHeader>
          <DialogTitle>{category ? t('categories.edit') : t('categories.new')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form noValidate onSubmit={form.handleSubmit(_handleSubmit)} className='flex flex-col gap-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categories.name')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        // Follow the name until the slug is edited by hand (new categories only).
                        if (!category && !form.formState.dirtyFields.slug)
                          form.setValue('slug', slugify(event.target.value));
                      }}
                    />
                  </FormControl>
                  <FieldError />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categories.slug')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>{t('categories.slugHint', { slug: slug || '...' })}</FormDescription>
                  <FieldError messageKey='slugInvalid' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='display_order'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categories.order')}</FormLabel>
                  <FormControl>
                    <Input type='number' inputMode='numeric' min={0} {...field} value={String(field.value ?? '')} />
                  </FormControl>
                  <FormDescription>{t('categories.orderHint')}</FormDescription>
                  <FieldError messageKey='numberInvalid' />
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
