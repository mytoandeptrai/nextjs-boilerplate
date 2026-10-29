'use client';
import { TextField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { type IItem1, useUpdateItem1Mutation } from '@/api/item1';
import { useTranslations } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const createFormSchema = (nameRequired: string) =>
  z.object({
    name: z.string().min(1, nameRequired),
  });

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface EditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item?: IItem1;
}

export function EditDialog({ isOpen, onOpenChange, item }: EditDialogProps) {
  const { t } = useTranslations('item');
  const { t: tValidation } = useTranslations('validation');
  const formSchema = useMemo(() => createFormSchema(tValidation('nameRequired')), [tValidation]);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || '',
    },
  });
  const { mutateAsync: updateItem } = useUpdateItem1Mutation();
  const onSubmit = async (values: FormValues) => {
    if (!item?.id) return;
    await updateItem({ id: item.id, ...values });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{t('editTitle')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <TextField control={form.control} name='name' label={t('name')} placeholder={t('namePlaceholder')} />
            <DialogFooter>
              <Button type='submit'>{t('saveChanges')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
