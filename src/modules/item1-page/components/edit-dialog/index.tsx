'use client';
import { TextField } from '@/components/form-fields';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useUpdateItem1Mutation } from '@/hooks/item1/use-update-item1-mutation';
import type { Item1 } from '@/types/item1';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface EditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Item1;
}

export function EditDialog({ isOpen, onOpenChange, item }: EditDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || '',
    },
  });
  const { mutate: updateItem } = useUpdateItem1Mutation();
  const onSubmit = async (values: FormValues) => {
    if (!item?.id) return;
    await updateItem({ id: item.id, ...values });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <TextField control={form.control} name='name' label='Name' placeholder='Enter item name' />
            <DialogFooter>
              <Button type='submit'>Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
