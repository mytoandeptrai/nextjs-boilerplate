'use client';

import { Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { type ReactNode, useId, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CONFIGURATOR_LIMITS, FULLNESS_OPTIONS, type Fullness } from '@/constants/const';
import { useTranslations } from '@/hooks';
import { formatVnd } from '@/lib/format';
import { calculatePrice } from '@/lib/pricing';
import { toCartItem } from '@/lib/quote';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores';
import type { IConfiguration, IProduct } from '@/types/catalog';

const DEFAULT_SIZE = { width: '200', height: '260' };

/** `'200'` -> 200; anything that is not a whole number -> NaN, which the pricing function rejects. */
const toCm = (value: string): number => (/^\d+$/.test(value.trim()) ? Number(value) : Number.NaN);

interface IOptionGroupProps<T extends string | number> {
  label: string;
  hint?: string;
  value: T;
  options: { value: T; label: string; detail?: string; color?: string }[];
  onChange: (value: T) => void;
}

/** Single-choice pills, exposed to assistive technology as a radio group. */
function OptionGroup<T extends string | number>({ label, hint, value, options, onChange }: IOptionGroupProps<T>) {
  const labelId = useId();

  return (
    <div>
      <p id={labelId} className='mb-3 text-sm font-medium'>
        {label}
      </p>
      <div role='radiogroup' aria-labelledby={labelId} className='flex flex-wrap gap-2'>
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type='button'
              role='radio'
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex min-h-11 items-center gap-2 border px-4 py-2 text-left text-sm transition-colors',
                isSelected ? 'border-foreground bg-foreground text-background' : 'border-input hover:border-foreground'
              )}
            >
              {option.color ? (
                <span
                  className='size-4 shrink-0 rounded-full border border-black/10'
                  style={{ backgroundColor: option.color }}
                  aria-hidden
                />
              ) : null}
              <span>
                {option.label}
                {option.detail ? (
                  <span className={cn('ml-1.5 text-xs', isSelected ? 'text-background/70' : 'text-muted-foreground')}>
                    {option.detail}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      {hint ? <p className='text-muted-foreground mt-2 text-xs'>{hint}</p> : null}
    </div>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint: string; children: ReactNode }) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the input is passed as children
    <label className='block'>
      <span className='mb-2 block text-sm font-medium'>{label}</span>
      {children}
      <span
        role={error ? 'alert' : undefined}
        className={cn('mt-1.5 block text-xs', error ? 'text-destructive' : 'text-muted-foreground')}
      >
        {error ?? hint}
      </span>
    </label>
  );
}

/**
 * Real-time configurator: every change re-runs `calculatePrice`, the same function the server uses when the quote is
 * submitted, so the estimate shown here is the one that gets stored.
 */
export function Configurator({ product }: { product: IProduct }) {
  const { t } = useTranslations('store.configurator');
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.setOpen);
  const isLinear = product.pricing_type === 'linear_meter';

  const [width, setWidth] = useState(DEFAULT_SIZE.width);
  const [height, setHeight] = useState(DEFAULT_SIZE.height);
  const [pleatId, setPleatId] = useState(product.pleat_options[0]?.id ?? null);
  const [fullness, setFullness] = useState<Fullness>(FULLNESS_OPTIONS[0]);
  const [fabricId, setFabricId] = useState(product.fabric_options[0]?.id ?? null);
  const [motorId, setMotorId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const config = useMemo<IConfiguration>(
    () => ({ widthCm: toCm(width), heightCm: toCm(height), pleatId, fullness, fabricId, motorId, quantity }),
    [width, height, pleatId, fullness, fabricId, motorId, quantity]
  );
  const price = useMemo(() => calculatePrice(product, config), [product, config]);
  const limits = CONFIGURATOR_LIMITS;
  const widthError = !price.ok && price.error === 'width' ? t('errorWidth', limits.width) : undefined;
  const heightError = !price.ok && price.error === 'height' ? t('errorHeight', limits.height) : undefined;

  const _handleAdd = () => {
    const item = toCartItem(product, config, crypto.randomUUID());

    if (!item) return;

    addItem(item);
    toast.success(t('added'));
    openCart(true);
  };

  return (
    <div className='flex flex-col gap-7' data-testid='configurator'>
      <div className='grid grid-cols-2 gap-4'>
        <Field label={t('width')} error={widthError} hint={t('range', limits.width)}>
          <Input
            name='width'
            inputMode='numeric'
            value={width}
            onChange={(event) => setWidth(event.target.value)}
            aria-invalid={Boolean(widthError)}
            className='h-12 rounded-none text-base'
          />
        </Field>
        <Field label={t('height')} error={heightError} hint={t('range', limits.height)}>
          <Input
            name='height'
            inputMode='numeric'
            value={height}
            onChange={(event) => setHeight(event.target.value)}
            aria-invalid={Boolean(heightError)}
            className='h-12 rounded-none text-base'
          />
        </Field>
      </div>

      {isLinear && product.pleat_options.length > 0 ? (
        <OptionGroup
          label={t('pleat')}
          value={pleatId ?? ''}
          onChange={setPleatId}
          options={product.pleat_options.map((option) => ({
            value: option.id,
            label: option.label,
            detail: option.multiplier === 1 ? undefined : `×${option.multiplier}`,
          }))}
        />
      ) : null}

      {isLinear ? (
        <OptionGroup
          label={t('fullness')}
          hint={t('fullnessHint')}
          value={fullness}
          onChange={setFullness}
          options={FULLNESS_OPTIONS.map((option, index) => ({
            value: option,
            label: `${option.toFixed(1)}x`,
            detail: index === 0 ? t('fullnessStandard') : t('fullnessLuxury'),
          }))}
        />
      ) : null}

      {product.fabric_options.length > 0 ? (
        <OptionGroup
          label={t('fabric')}
          value={fabricId ?? ''}
          onChange={setFabricId}
          options={product.fabric_options.map((option) => ({
            value: option.id,
            label: option.label,
            color: option.color,
            detail: option.price_delta > 0 ? `+${formatVnd(option.price_delta)}` : undefined,
          }))}
        />
      ) : null}

      {product.motor_options.length > 0 ? (
        <OptionGroup
          label={t('motor')}
          value={motorId ?? ''}
          onChange={(value) => setMotorId(value || null)}
          options={[
            { value: '', label: t('noMotor') },
            ...product.motor_options.map((option) => ({
              value: option.id,
              label: option.label,
              detail: `+${formatVnd(option.price)}`,
            })),
          ]}
        />
      ) : null}

      <div>
        <p className='mb-3 text-sm font-medium'>{t('quantity')}</p>
        <div className='border-input inline-flex items-center border'>
          <button
            type='button'
            onClick={() => setQuantity((value) => Math.max(limits.quantity.min, value - 1))}
            disabled={quantity <= limits.quantity.min}
            aria-label={t('decrease')}
            className='flex size-12 items-center justify-center disabled:opacity-30'
          >
            <Minus className='size-4' aria-hidden />
          </button>
          <span className='w-10 text-center tabular-nums' aria-live='polite'>
            {quantity}
          </span>
          <button
            type='button'
            onClick={() => setQuantity((value) => Math.min(limits.quantity.max, value + 1))}
            disabled={quantity >= limits.quantity.max}
            aria-label={t('increase')}
            className='flex size-12 items-center justify-center disabled:opacity-30'
          >
            <Plus className='size-4' aria-hidden />
          </button>
        </div>
      </div>

      <div className='border-border border-t pt-6'>
        <div className='flex items-end justify-between gap-4'>
          <span className='text-muted-foreground text-sm'>{t('estimate')}</span>
          <div className='text-right' aria-live='polite'>
            <p className='text-3xl font-light tracking-tight tabular-nums' data-testid='estimate'>
              {price.ok ? formatVnd(price.lineTotal) : '—'}
            </p>
            {price.ok && quantity > 1 ? (
              <p className='text-muted-foreground text-xs tabular-nums'>
                {t('perPiece', { price: formatVnd(price.unitPrice) })}
              </p>
            ) : null}
          </div>
        </div>
        <ul className='text-muted-foreground mt-4 space-y-1.5 text-xs'>
          <li className='flex gap-2'>
            <Check className='text-brand mt-0.5 size-3.5 shrink-0' aria-hidden />
            {t('estimateNote')}
          </li>
          {isLinear ? null : (
            <li className='flex gap-2'>
              <Check className='text-brand mt-0.5 size-3.5 shrink-0' aria-hidden />
              {t('minArea')}
            </li>
          )}
        </ul>
        <Button
          type='button'
          size='lg'
          className='mt-6 h-14 w-full rounded-none text-base'
          disabled={!price.ok}
          onClick={_handleAdd}
        >
          <ShoppingBag aria-hidden />
          {t('addToCart')}
        </Button>
      </div>
    </div>
  );
}
