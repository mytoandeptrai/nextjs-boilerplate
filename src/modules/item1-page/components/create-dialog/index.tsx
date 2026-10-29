'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DialogFooter } from '@/components/ui/dialog';
import { useMemo, useState } from 'react';
import { useCreateItem1Mutation } from '@/api/item1';
import { useTranslations } from '@/hooks';

const createFormSchema = (nameRequired: string) =>
  z.object({
    name: z.string().min(1, nameRequired),
  });

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

export function CreateDialog() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslations();
  const { t: tValidation } = useTranslations('validation');
  const formSchema = useMemo(() => createFormSchema(tValidation('nameRequired')), [tValidation]);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });
  const { mutate: createItem } = useCreateItem1Mutation();

  const onSubmit = (values: FormValues) => {
    createItem(values, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t('common.create')}</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{t('common.create')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('item.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('item.name')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='submit'>{t('common.create')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
