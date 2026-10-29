'use client';
import type React from 'react';
import { LOCALES, type Locale } from '@/i18n/routing';
import { FormField } from '@/components/ui/form';
import type {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
  UseFormStateReturn,
} from 'react-hook-form';
import { cn } from '@/lib/utils';

type MultiLangFormFieldProps<T extends FieldValues> = {
  activeLocale: Locale;
  control: Control<T>;
  name: string;
  render: (
    props: {
      field: ControllerRenderProps<T, Path<T>>;
      fieldState: ControllerFieldState;
      formState: UseFormStateReturn<T>;
    },
    locale: string
  ) => React.ReactElement;
};

export function MultiLangFormField<T extends FieldValues>({
  control,
  name,
  render,
  activeLocale,
}: MultiLangFormFieldProps<T>) {
  return (
    <>
      {LOCALES.map((locale) => (
        <div key={`${name}.${locale}`} className={cn(activeLocale === locale ? 'block' : 'hidden')}>
          <FormField
            control={control}
            name={`${name}.${locale}` as Path<T>}
            render={(controllerProps) => render(controllerProps, locale)}
          />
        </div>
      ))}
    </>
  );
}
