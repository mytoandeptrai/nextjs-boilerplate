'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  type SettingsBody,
  type SettingsFormInput,
  settingsSchema,
  useSettingsQuery,
  useUpdateSettingsMutation,
} from '@/api/admin-settings';
import { FieldError } from '@/components/admin/field-error';
import { AdminPageHeader } from '@/components/admin/page-header';
import { QueryState } from '@/components/admin/query-state';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/hooks';

function SettingsForm({ settings }: { settings: SettingsBody }) {
  const { t } = useTranslations('admin');
  const { mutate, isPending } = useUpdateSettingsMutation();
  const form = useForm<SettingsFormInput, unknown, SettingsBody>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  const _handleSubmit = (body: SettingsBody) =>
    mutate(body, {
      onSuccess: (saved) => {
        form.reset(saved);
        toast.success(t('common.saved'));
      },
      onError: () => void toast.error(t('common.saveError')),
    });

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(_handleSubmit)}
        className='bg-card max-w-xl space-y-5 border p-4 lg:p-6'
      >
        <FormField
          control={form.control}
          name='zalo_hotline'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.zaloHotline')}</FormLabel>
              <FormControl>
                <Input type='tel' inputMode='tel' {...field} />
              </FormControl>
              <FormDescription>{t('settings.zaloHotlineHint')}</FormDescription>
              <FieldError messageKey='hotlineInvalid' />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='quote_notification_email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.notificationEmail')}</FormLabel>
              <FormControl>
                <Input type='email' inputMode='email' {...field} />
              </FormControl>
              <FormDescription>{t('settings.notificationEmailHint')}</FormDescription>
              <FieldError messageKey='invalidEmail' />
            </FormItem>
          )}
        />
        <p className='border-brand bg-secondary text-muted-foreground border-l-2 px-3 py-2 text-xs leading-5'>
          {t('settings.emailNote')}
        </p>
        <Button type='submit' size='lg' className='h-11 rounded-none px-8' disabled={isPending}>
          {isPending ? <Loader2 className='animate-spin' aria-hidden /> : null}
          {isPending ? t('common.saving') : t('common.save')}
        </Button>
      </form>
    </Form>
  );
}

export default function AdminSettingsPage() {
  const { t } = useTranslations('admin');
  const { data, isLoading, isError, refetch } = useSettingsQuery();

  return (
    <>
      <AdminPageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />
      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        {data ? <SettingsForm settings={data} /> : null}
      </QueryState>
    </>
  );
}
