'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ClipboardCopy, Home, Loader2, MessageCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  type CheckoutFormData,
  type CheckoutFormInput,
  createCheckoutSchema,
  useCreateQuoteMutation,
} from '@/api/quotes';
import { useStore } from '@/components/store/store-provider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HttpStatus } from '@/enums/enum';
import { type ICartLine, useCartLines, useTranslations } from '@/hooks';
import { formatVnd, toOrderCode } from '@/lib/format';
import { cartItemToQuoteLine, toQuoteLine } from '@/lib/quote';
import { buildZaloOrder, type IZaloLabels } from '@/lib/zalo';
import { useCartStore } from '@/stores';
import type { IQuoteLine, QuoteChannel } from '@/types/catalog';

interface ICheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ISuccess {
  channel: QuoteChannel;
  orderCode: string;
  message: string;
  zaloUrl: string | null;
  /** The Zalo chat opened but the lead could not be stored. */
  isSaved: boolean;
}

/** Price each line from the current product when it is loaded, otherwise from the cart snapshot. */
const toQuoteLines = (lines: ICartLine[]): IQuoteLine[] =>
  lines.map(({ item, product }) => (product && toQuoteLine(product, item)) || cartItemToQuoteLine(item));

const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);

    return true;
  } catch {
    return false;
  }
};

/**
 * Lead checkout, no payment: the customer either sends the formatted order to the shop's Zalo, or asks for a home
 * survey (stored in the quote inbox, with an email alert). Both paths store the lead through `POST /api/quotes`.
 */
export function CheckoutDialog({ open, onOpenChange }: ICheckoutDialogProps) {
  const { t } = useTranslations('store');
  const { t: tValidation } = useTranslations('validation');
  const { zaloHotline } = useStore();
  const { lines, total, hasUnavailable } = useCartLines(open);
  const clearCart = useCartStore((state) => state.clear);
  const { mutate, isPending } = useCreateQuoteMutation();
  const [pendingChannel, setPendingChannel] = useState<QuoteChannel | null>(null);
  const [success, setSuccess] = useState<ISuccess | null>(null);

  const schema = useMemo(
    () =>
      createCheckoutSchema({
        nameRequired: tValidation('nameRequired'),
        phoneInvalid: tValidation('phoneInvalid'),
        tooLong: tValidation('tooLong'),
      }),
    [tValidation]
  );
  const form = useForm<CheckoutFormInput, unknown, CheckoutFormData>({
    resolver: zodResolver(schema),
    defaultValues: { customerName: '', customerPhone: '', customerAddress: '', notes: '', website: '' },
  });

  const zaloLabels = useMemo<IZaloLabels>(
    () => ({
      heading: t('zalo.heading'),
      code: t('zalo.code'),
      customer: t('zalo.customer'),
      address: t('zalo.address'),
      width: t('zalo.width'),
      height: t('zalo.height'),
      fullness: t('zalo.fullness'),
      subtotal: t('zalo.subtotal'),
      total: t('zalo.total'),
      notes: t('zalo.notes'),
      more: (count) => t('zalo.more', { count }),
    }),
    [t]
  );

  const _handleOpenChange = (next: boolean) => {
    onOpenChange(next);

    if (!next) {
      // Wait for the close animation before resetting, so the content does not flash.
      setTimeout(() => {
        setSuccess(null);
        form.reset();
      }, 200);
    }
  };

  const _submit = (channel: QuoteChannel) =>
    form.handleSubmit((values) => {
      const id = crypto.randomUUID();
      const orderCode = toOrderCode(id);
      const quoteLines = toQuoteLines(lines);
      const { message, url } = buildZaloOrder(
        zaloHotline,
        {
          orderCode,
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          customerAddress: values.customerAddress,
          notes: values.notes,
          lines: quoteLines,
          total: quoteLines.reduce((sum, line) => sum + line.line_total, 0),
        },
        zaloLabels
      );

      if (channel === 'zalo') {
        // Open the chat inside the click handler: after an `await` the browser would block the popup.
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
        void copyText(message);
      }

      setPendingChannel(channel);
      mutate(
        {
          ...values,
          id,
          channel,
          items: lines.map(({ item }) => ({
            productId: item.productId,
            widthCm: item.widthCm,
            heightCm: item.heightCm,
            pleatId: item.pleatId,
            fullness: item.fullness,
            fabricId: item.fabricId,
            motorId: item.motorId,
            quantity: item.quantity,
          })),
        },
        {
          onSuccess: () => {
            setSuccess({ channel, orderCode, message, zaloUrl: url, isSaved: true });
            clearCart();
          },
          onError: (error) => {
            if (error.status === HttpStatus.CONFLICT) return void toast.error(t('checkout.errorUnavailable'));
            if (error.status === HttpStatus.TOO_MANY_REQUESTS) return void toast.error(t('checkout.errorRateLimit'));
            // The order text already reached Zalo: keep the customer on the confirmation, with a warning.
            if (channel === 'zalo' && url)
              return void setSuccess({ channel, orderCode, message, zaloUrl: url, isSaved: false });

            toast.error(t('checkout.errorGeneric'));
          },
          onSettled: () => setPendingChannel(null),
        }
      );
    });

  const _handleCopy = async () => {
    if (success && (await copyText(success.message))) toast.success(t('checkout.copied'));
  };

  const _successText = ({ channel, isSaved }: ISuccess) => {
    if (channel === 'email') return t('checkout.successSurvey');

    return isSaved ? t('checkout.successZalo') : t('checkout.zaloNotSaved');
  };

  const isDisabled = isPending || hasUnavailable || lines.length === 0;

  return (
    <Dialog open={open} onOpenChange={_handleOpenChange}>
      <DialogContent className='max-h-[100dvh] w-full max-w-lg overflow-y-auto rounded-none p-6 sm:max-h-[92dvh] sm:p-8'>
        {success ? (
          <div className='flex flex-col items-center text-center' data-testid='checkout-success'>
            <CheckCircle2 className='text-brand size-12' strokeWidth={1.25} aria-hidden />
            <DialogHeader className='mt-4 sm:text-center'>
              <DialogTitle className='text-2xl font-light'>{t('checkout.successTitle')}</DialogTitle>
              <DialogDescription className='leading-6'>{_successText(success)}</DialogDescription>
            </DialogHeader>
            <p className='border-border bg-muted mt-5 border px-4 py-2 text-sm'>
              {t('checkout.orderCode')}: <span className='font-mono font-semibold'>{success.orderCode}</span>
            </p>
            <div className='mt-6 flex w-full flex-col gap-3'>
              {success.channel === 'zalo' && success.zaloUrl ? (
                <Button asChild size='lg' className='h-12 rounded-none'>
                  <a href={success.zaloUrl} target='_blank' rel='noopener noreferrer'>
                    <MessageCircle aria-hidden />
                    {t('checkout.openZalo')}
                  </a>
                </Button>
              ) : null}
              {success.channel === 'zalo' ? (
                <Button type='button' variant='outline' size='lg' className='h-12 rounded-none' onClick={_handleCopy}>
                  <ClipboardCopy aria-hidden />
                  {t('checkout.copyMessage')}
                </Button>
              ) : null}
              <Button
                type='button'
                variant={success.channel === 'zalo' ? 'ghost' : 'default'}
                size='lg'
                className='h-12 rounded-none'
                onClick={() => _handleOpenChange(false)}
              >
                {t('checkout.done')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className='text-2xl font-light'>{t('checkout.title')}</DialogTitle>
              <DialogDescription>{t('checkout.subtitle')}</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form noValidate className='mt-2 flex flex-col gap-4' onSubmit={_submit(zaloHotline ? 'zalo' : 'email')}>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='customerName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('checkout.name')}</FormLabel>
                        <FormControl>
                          <Input autoComplete='name' placeholder={t('checkout.namePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='customerPhone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('checkout.phone')}</FormLabel>
                        <FormControl>
                          <Input
                            type='tel'
                            inputMode='tel'
                            autoComplete='tel'
                            placeholder={t('checkout.phonePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name='customerAddress'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('checkout.address')}</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete='street-address'
                          placeholder={t('checkout.addressPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='notes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('checkout.notes')}</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder={t('checkout.notesPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Honeypot: invisible to people and assistive technology, tempting for bots. */}
                <input
                  type='text'
                  tabIndex={-1}
                  autoComplete='off'
                  aria-hidden
                  className='absolute -left-[9999px] size-px opacity-0'
                  {...form.register('website')}
                />

                <div className='border-border flex items-baseline justify-between border-t pt-4'>
                  <span className='text-muted-foreground text-sm'>{t('cart.total')}</span>
                  <span className='text-xl font-medium tabular-nums'>{formatVnd(total)}</span>
                </div>

                <div className='flex flex-col gap-3'>
                  {zaloHotline ? (
                    <Button
                      type='button'
                      size='lg'
                      className='h-12 rounded-none'
                      disabled={isDisabled}
                      onClick={_submit('zalo')}
                    >
                      {pendingChannel === 'zalo' ? (
                        <Loader2 className='animate-spin' aria-hidden />
                      ) : (
                        <MessageCircle aria-hidden />
                      )}
                      {pendingChannel === 'zalo' ? t('checkout.sending') : t('checkout.zaloButton')}
                    </Button>
                  ) : null}
                  <Button
                    type='button'
                    size='lg'
                    variant={zaloHotline ? 'outline' : 'default'}
                    className='h-12 rounded-none'
                    disabled={isDisabled}
                    onClick={_submit('email')}
                  >
                    {pendingChannel === 'email' ? (
                      <Loader2 className='animate-spin' aria-hidden />
                    ) : (
                      <Home aria-hidden />
                    )}
                    {pendingChannel === 'email' ? t('checkout.sending') : t('checkout.surveyButton')}
                  </Button>
                  {zaloHotline ? (
                    <p className='text-muted-foreground text-center text-xs'>{t('checkout.zaloHint')}</p>
                  ) : null}
                  {hasUnavailable ? (
                    <p role='alert' className='text-destructive text-center text-xs'>
                      {t('checkout.errorUnavailable')}
                    </p>
                  ) : null}
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
