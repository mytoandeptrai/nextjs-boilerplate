import type { ReactNode } from 'react';
import type { Control, FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { TextareaProps } from '../ui/textarea';
import { Textarea } from '../ui/textarea';
import { Show } from '../utilities';

interface Props<T extends FieldValues = FieldValues> extends TextareaProps {
  control: Control<T>;
  name: FieldPath<T>;
  defaultValue?: FieldPathValue<T, FieldPath<T>>;
  label?: ReactNode;
  required?: boolean;
  requiredClassName?: string;
  labelClassName?: string;
  subLabel?: string;
  containerClassName?: string;
}

const TextAreaField = <T extends FieldValues>({
  defaultValue,
  labelClassName,
  control,
  label,
  required,
  subLabel,
  requiredClassName,
  containerClassName,
  ...props
}: Props<T>) => {
  return (
    <FormField
      control={control}
      name={props.name}
      defaultValue={defaultValue}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className={containerClassName}>
              <Show when={!!label}>
                <FormLabel className={cn('flex flex-col gap-1', labelClassName)}>
                  <p className='flex gap-1 text-sm text-gray-200'>
                    {label}
                    {required && <span className={cn('text-red-500', requiredClassName)}>*</span>}
                  </p>
                  {subLabel && <p className='text-xs text-gray-200'>{subLabel}</p>}
                </FormLabel>
              </Show>
              <Textarea {...field} {...props} />
            </div>
          </FormControl>
          <FormMessage className='mt-1.5 text-sm text-red-500' />
        </FormItem>
      )}
    />
  );
};

export { TextAreaField };
