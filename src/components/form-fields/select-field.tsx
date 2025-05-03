import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import React from 'react';
import type { Control, FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';

import { cn } from '@/libs/utils';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { HStack, Show, VStack } from '../utilities';
import { ImageLoader } from '../ui/image-loader';

export interface ISelectData {
  label: string | React.JSX.Element | ReactNode;
  subLabel?: string | React.JSX.Element | ReactNode;
  value: string;
  image?: string;
  group?: string;
}

interface Props<T extends FieldValues = FieldValues> extends React.SelectHTMLAttributes<HTMLSelectElement> {
  control: Control<T>;
  name: FieldPath<T>;
  defaultValue?: FieldPathValue<T, FieldPath<T>>;
  label?: ReactNode;
  subLabel?: ReactNode;
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
  labelClassName?: string;
  data: ISelectData[];
  iconClassName?: string;
  arrowIcon?: LucideIcon;
  requiredClassName?: string;
  isShowCheck?: boolean;
  isError?: boolean;
  noDataText?: ReactNode | string;
  isShowIcon?: boolean;
}

const SelectField = <T extends FieldValues>({
  name,
  defaultValue,
  control,
  label,
  subLabel,
  required,
  data,
  fullWidth,
  className,
  labelClassName,
  placeholder = 'Please select',
  requiredClassName,
  isShowCheck = true,
  isError,
  noDataText = 'No data',
  iconClassName,
  isShowIcon = true,
  ...props
}: Props<T>) => {
  return (
    <FormField
      defaultValue={defaultValue}
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <div className={cn('relative', fullWidth ? 'w-full' : '')}>
            <FormItem>
              <Select
                onValueChange={(value) => value && field.onChange(value)}
                value={field.value}
                disabled={props.disabled}
              >
                <FormControl>
                  <div>
                    <Show when={!!label}>
                      <FormLabel className={cn('flex flex-col gap-1', labelClassName)}>
                        <p className='flex gap-1 text-gray-300 text-sm'>
                          {label}
                          {required && <span className={cn('text-error-500', requiredClassName)}>*</span>}
                        </p>
                        {subLabel && <p className='text-gray-300 text-xs'>{subLabel}</p>}
                      </FormLabel>
                    </Show>
                    <SelectTrigger
                      className={cn(className, {
                        'w-full': fullWidth,
                        'text-white': !!field.value,
                        'border-error-300': isError,
                      })}
                    >
                      <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                  </div>
                </FormControl>

                <SelectContent>
                  <Show when={!data?.length}>
                    {typeof noDataText === 'string' ? (
                      <p className='py-2 text-center text-sm dark:text-gray-200'>{noDataText}</p>
                    ) : (
                      noDataText
                    )}
                  </Show>

                  {!!data?.length &&
                    data?.map((x) => (
                      <SelectItem key={x.value} value={x.value}>
                        {x.image || x.subLabel ? (
                          <HStack spacing={8} className='w-full'>
                            {x.image && (
                              <div
                                className={cn('relative aspect-square w-8 overflow-hidden rounded-full', iconClassName)}
                              >
                                <ImageLoader src={x.image!} alt='options img' fill className='object-cover' />
                              </div>
                            )}

                            <VStack spacing={0}>
                              <p className='text-left font-semibold text-gray-25'>{x.label}</p>
                              {x?.subLabel && <p className='text-left text-gray-25'>{x?.subLabel}</p>}
                            </VStack>
                          </HStack>
                        ) : (
                          x.label
                        )}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage className='mt-1.5 text-error-300 text-sm' />
            </FormItem>
          </div>
        );
      }}
    />
  );
};

export { SelectField };
