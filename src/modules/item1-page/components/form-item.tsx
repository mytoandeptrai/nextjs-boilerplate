'use client';
import { Label } from '@/components/ui/label';
import { FormMessage } from '@/components/ui/form';
import type { ReactNode } from 'react';

type FormItemProps = {
  label: string;
  required?: boolean;
  description?: string;
  inputComponent: ReactNode;
};

export default function FormItem({ label, required = false, description, inputComponent }: FormItemProps) {
  return (
    <div className='grid grid-cols-2 gap-4'>
      <div>
        <Label className='text-base'>
          {label}
          {required && <span className='text-red-500'>*</span>}
        </Label>
        {description && <span className='text-gray-400 text-sm'>{description}</span>}
      </div>
      <div>
        <div>{inputComponent}</div>
        <FormMessage />
      </div>
    </div>
  );
}
