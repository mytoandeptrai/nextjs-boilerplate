import type { Control, FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';

import { cn } from '@/libs/utils';
import type { ReactNode } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { InputFile, type InputFileProps } from '../ui/input-file';
import { Show } from '../utilities';

interface Props<T extends FieldValues = FieldValues> extends InputFileProps {
  control: Control<T>;
  name: FieldPath<T>;
  defaultValue?: FieldPathValue<T, FieldPath<T>>;
  label?: string;
  subLabel?: ReactNode;
  labelClassName?: string;
  requiredClassName?: string;
  required?: boolean;
  onChange: (file: File | null, blob?: string) => void;
}

const InputFileField = <T extends FieldValues>({
  className,
  labelClassName,
  control,
  defaultValue,
  label,
  required,
  onChange,
  subLabel,
  requiredClassName,
  ...props
}: Props<T>) => {
  return (
    <FormField
      defaultValue={defaultValue}
      control={control}
      name={props.name}
      render={({ field }) => (
        <FormItem>
          <FormControl className='w-full'>
            <div>
              <Show when={!!label}>
                <FormLabel className={cn('flex flex-col gap-1', labelClassName)}>
                  <p className={cn('flex gap-1 font-medium text-sm text-white md:text-lg', labelClassName)}>
                    {label}
                    {required && <span className={cn('text-error-300', requiredClassName)}>*</span>}
                  </p>
                  {subLabel && <p className='text-gray-300 text-xs'>{subLabel}</p>}
                </FormLabel>
              </Show>
              <InputFile className={className} {...props} {...field} onChange={onChange} />
              <FormMessage className='mt-1.5 text-error-300 text-sm' />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export { InputFileField };
