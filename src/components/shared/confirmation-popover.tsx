'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { PopoverClose } from '@radix-ui/react-popover';

interface ConfirmationPopoverProps {
  children: React.ReactNode;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  disabled?: boolean;
}

export default function ConfirmationPopover({
  children,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  disabled = false,
}: ConfirmationPopoverProps) {
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        {children}
      </PopoverTrigger>
      <PopoverContent className='w-80'>
        <div className='grid gap-4'>
          {title && <h4 className='font-medium leading-none'>{title}</h4>}
          {description && <p className='text-muted-foreground text-sm'>{description}</p>}
          <div className='flex justify-end gap-2'>
            <PopoverClose asChild>
              <Button variant='outline' size='sm'>
                {cancelText || t('common.cancel')}
              </Button>
            </PopoverClose>
            <PopoverClose asChild>
              <Button variant='destructive' size='sm' onClick={onConfirm}>
                {confirmText || t('common.confirm')}
              </Button>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
