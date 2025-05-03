import { type HTMLAttributes, useId } from 'react';
import type { Control, FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';

import { cn } from '@/libs/utils';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Switch } from '../ui/switch';
import { Show } from '../utilities';

interface SwitchProps<T extends FieldValues = FieldValues> {
  isChecked?: boolean;
  control: Control<T>;
  name: FieldPath<T>;
  defaultValue?: FieldPathValue<T, FieldPath<T>>;
  label?: string;
  labelClassName?: HTMLAttributes<HTMLLabelElement>['className'];
  containerClassName?: HTMLAttributes<HTMLDivElement>['className'];
  requiredClassName?: HTMLAttributes<HTMLSpanElement>['className'];
  required?: boolean;
  className?: string;
}

const SwitchField = <T extends FieldValues>({
  className,
  labelClassName,
  requiredClassName,
  control,
  defaultValue,
  label,
  required,
  name,
  containerClassName,
  ...props
}: SwitchProps<T>) => {
  const id = useId();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className={cn('flex items-center gap-4', containerClassName)}>
              <Switch id={id} checked={field.value} onCheckedChange={field.onChange} {...props} />

              <Show when={!!label}>
                <FormLabel className={cn('mb-0 flex flex-col gap-1', labelClassName)} htmlFor={id}>
                  <p className='flex gap-1 text-gray-300 text-sm'>
                    {label}
                    {required && <span className={cn('text-error-500', requiredClassName)}>*</span>}
                  </p>
                </FormLabel>
              </Show>

              <FormMessage className='mt-1.5 text-error-300 text-sm' />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export { SwitchField };
