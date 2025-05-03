import type { Control, FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';

import { cn } from '@/libs/utils';
import type { HTMLAttributes } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { InputProps } from '../ui/input';
import { Input } from '../ui/input';
import { Show } from '../utilities';

interface Props<T extends FieldValues = FieldValues> extends InputProps {
  control: Control<T>;
  name: FieldPath<T>;
  defaultValue?: FieldPathValue<T, FieldPath<T>>;
  label?: string;
  labelClassName?: string;
  requiredClassName?: string;
  inputContainerClassName?: HTMLAttributes<HTMLDivElement>['className'];
  required?: boolean;
  subLabel?: string;
  isShowError?: boolean;
}

const NumberField = <T extends FieldValues>({
  className,
  labelClassName,
  control,
  defaultValue,
  label,
  required,
  subLabel,
  requiredClassName,
  inputContainerClassName,
  isShowError = true,
  ...props
}: Props<T>) => {
  return (
    <FormField
      defaultValue={defaultValue}
      control={control}
      name={props.name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div>
              <Show when={!!label}>
                <FormLabel className={cn('flex flex-col gap-1', labelClassName)}>
                  <p className='flex gap-1 text-gray-300 text-sm'>
                    {label}
                    {required && <span className={cn('text-error-500', requiredClassName)}>*</span>}
                  </p>
                  {subLabel && <p className='text-gray-200 text-xs'>{subLabel}</p>}
                </FormLabel>
              </Show>
              <Input
                type='number'
                {...field}
                {...props}
                containerClassName={inputContainerClassName}
                className={className}
              />
              {isShowError && <FormMessage className='mt-1.5 text-sm dark:text-error-300' />}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export { NumberField };
