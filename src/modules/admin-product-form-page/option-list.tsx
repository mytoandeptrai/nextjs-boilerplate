'use client';

import { Plus, Trash2 } from 'lucide-react';
import { type Control, Controller, type FieldArrayPath, type FieldPath, useFieldArray } from 'react-hook-form';

import type { ProductFormInput } from '@/api/admin-products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/hooks';

const DEFAULT_COLOR = '#d9d3c7';

type OptionListName = Extract<FieldArrayPath<ProductFormInput>, 'pleat_options' | 'fabric_options' | 'motor_options'>;

interface IOptionListProps {
  control: Control<ProductFormInput>;
  name: OptionListName;
  title: string;
  hint: string;
  /** Numeric column of this option type. */
  valueKey: 'multiplier' | 'price_delta' | 'price';
  valueLabel: string;
  valueStep: string;
  defaultValue: number;
  hasColor?: boolean;
  hasError?: boolean;
}

/** Editable rows for one kind of customer option (pleats, fabrics or motors). */
export function OptionList({
  control,
  name,
  title,
  hint,
  valueKey,
  valueLabel,
  valueStep,
  defaultValue,
  hasColor = false,
  hasError = false,
}: IOptionListProps) {
  const { t } = useTranslations();
  const { fields, append, remove } = useFieldArray({ control, name });
  const register = control.register as (path: string) => ReturnType<typeof control.register>;

  const _handleAdd = () =>
    append({
      id: crypto.randomUUID().slice(0, 8),
      label: '',
      [valueKey]: defaultValue,
      ...(hasColor ? { color: DEFAULT_COLOR } : {}),
    } as never);

  return (
    <fieldset>
      <legend className='text-sm font-medium'>{title}</legend>
      <p className='text-muted-foreground mt-1 text-xs'>{hint}</p>

      {fields.length > 0 ? (
        <ul className='mt-3 space-y-2'>
          {fields.map((field, index) => (
            <li key={field.id} className='flex items-center gap-2'>
              {hasColor ? (
                // A colour input has no empty state, so it is controlled: the swatch always shows the stored value.
                <Controller
                  control={control}
                  name={`${name}.${index}.color` as FieldPath<ProductFormInput>}
                  render={({ field: color }) => (
                    <input
                      type='color'
                      aria-label={t('admin.products.form.color')}
                      className='bg-card size-9 shrink-0 cursor-pointer border p-0.5'
                      value={typeof color.value === 'string' ? color.value : DEFAULT_COLOR}
                      onChange={color.onChange}
                      onBlur={color.onBlur}
                    />
                  )}
                />
              ) : null}
              <Input
                aria-label={t('admin.products.form.optionLabel')}
                placeholder={t('admin.products.form.optionLabel')}
                className='min-w-0 flex-1'
                {...register(`${name}.${index}.label`)}
              />
              <Input
                type='number'
                inputMode='decimal'
                min={0}
                step={valueStep}
                aria-label={valueLabel}
                placeholder={valueLabel}
                className='w-28 shrink-0 sm:w-36'
                {...register(`${name}.${index}.${valueKey}`)}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='shrink-0'
                aria-label={t('admin.products.form.removeOption')}
                onClick={() => remove(index)}
              >
                <Trash2 aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      {hasError ? (
        <p role='alert' className='text-destructive mt-2 text-sm'>
          {t('validation.required')}
        </p>
      ) : null}
      <Button type='button' variant='outline' size='sm' className='mt-3 rounded-none' onClick={_handleAdd}>
        <Plus aria-hidden />
        {t('admin.products.form.addOption')}
      </Button>
    </fieldset>
  );
}
