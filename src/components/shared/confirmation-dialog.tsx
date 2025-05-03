'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface ConfirmationDialogProps {
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  children: React.ReactNode;
}

export default function ConfirmationDialog({
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  children,
}: ConfirmationDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>{title && <DialogTitle>{title}</DialogTitle>}</DialogHeader>
        {description && (
          <div className='py-4'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
        )}
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            {cancelText || t('common.cancel')}
          </Button>
          <Button variant='destructive' onClick={handleConfirm}>
            {confirmText || t('common.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
