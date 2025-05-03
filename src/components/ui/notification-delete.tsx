'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NotificationDeleteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  itemName: string;
}

export function NotificationDelete({ isOpen, onOpenChange, onConfirm, onCancel, itemName }: NotificationDeleteProps) {
  const { t } = useTranslation();
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 bg-black/20 data-[state=closed]:animate-out data-[state=open]:animate-in' />
        <Dialog.Content className='data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:rounded-lg'>
          <div className='flex flex-col space-y-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-full bg-orange-50 p-2'>
                <AlertCircle className='h-5 w-5 text-orange-500' />
              </div>
              <Dialog.Title className='font-medium text-lg'>{t('common.delete')}</Dialog.Title>
            </div>

            <Dialog.Description className='text-gray-500 text-sm'>
              {t('common.deleteConfirmation', { itemName })}
            </Dialog.Description>

            <div className='flex justify-end gap-2 pt-2'>
              <button
                onClick={onCancel}
                className='inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-brand-60 bg-white px-4 py-2 font-medium text-brand-60 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-60 focus:ring-offset-2'
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={onConfirm}
                className='inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-brand-60 px-4 py-2 font-medium text-sm text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
              >
                {t('common.delete')}
              </button>
            </div>
          </div>

          <Dialog.Close className='absolute top-4 right-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100'>
            <X className='h-4 w-4' />
            <span className='sr-only'>{t('common.close')}</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
