import type { Control, FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { cn } from '@/libs/utils';
import type { RadioGroupProps } from '@radix-ui/react-radio-group';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Show } from '../utilities';

interface RadioGroupFieldProps<T extends FieldValues = FieldValues> extends RadioGroupProps {
  control: Control<T>;
  name: FieldPath<T>;
  defaultValue?: FieldPathValue<T, FieldPath<T>>;
  data?: { label: string; value: string }[];
  className?: string;
  label?: string;
  labelClassName?: string;
  required?: boolean;
  containerClassName?: string;
  requiredClassName?: string;
  subLabel?: string;
}

const RadioGroupField = <T extends FieldValues>({
  control,
  name,
  data = [],
  className,
  labelClassName,
  defaultValue,
  label,
  required,
  containerClassName,
  requiredClassName,
  subLabel,
  ...props
}: RadioGroupFieldProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className={cn(containerClassName)}>
            <Show when={!!label}>
              <FormLabel className={cn('flex flex-col gap-1')}>
                <p className={cn('flex gap-1 text-gray-300 text-sm', labelClassName)}>
                  {label}
                  {required && <span className={cn('text-error-300', requiredClassName)}>*</span>}
                </p>
                {subLabel && <p className='text-gray-300 text-xs'>{subLabel}</p>}
              </FormLabel>
            </Show>

            <FormControl>
              <RadioGroup
                className={className}
                defaultValue={defaultValue}
                value={field.value}
                onValueChange={field.onChange}
                {...props}
              >
                {data.map(({ label, value }, i) => (
                  <label key={i} className='col-span-1 flex cursor-pointer items-center space-x-2'>
                    <RadioGroupItem value={value} />
                    <p className='font-medium text-sm'>{label}</p>
                  </label>
                ))}
              </RadioGroup>
            </FormControl>
          </div>
          <FormMessage className='text-xs' />
        </FormItem>
      )}
    />
  );
};

export { RadioGroupField };
